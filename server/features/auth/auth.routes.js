import express from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'node:crypto';
import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';

import { pool } from '../../index.js';
import { authenticateToken } from '../../middleware/auth.js';
import { AuthService } from '../../services/auth.service.js';
import { getPasskeyRp } from './auth.config.js';

const router = express.Router();

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AuthService.refreshTokenTtlMs(),
    path: '/api/auth',
  };
}

function setRefreshCookie(res, raw) {
  res.cookie('refreshToken', raw, refreshCookieOptions());
}

function clearRefreshCookie(res) {
  res.clearCookie('refreshToken', { path: '/api/auth' });
}

async function issueSession(res, userRow) {
  const access = AuthService.generateAccessToken(userRow);
  const refresh = await AuthService.issueRefreshToken(userRow.id);
  setRefreshCookie(res, refresh);
  return access;
}

function base64urlToBuffer(b64url) {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64');
}

function bufferToBase64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function randomToken(bytes = 32) {
  return bufferToBase64url(crypto.randomBytes(bytes));
}

function decodeClientDataJSON(clientDataJSON) {
  try {
    const json = base64urlToBuffer(clientDataJSON).toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

async function ensureUserForEmail(email) {
  const existing = await pool.query(
    'SELECT id, email, username, full_name, role FROM users WHERE email = $1',
    [email]
  );
  if (existing.rows.length) return existing.rows[0];

  const base = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 20) || 'user';

  let username = base;
  for (let i = 0; i < 6; i++) {
    const check = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (!check.rows.length) break;
    username = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
  }

  const inserted = await pool.query(
    `INSERT INTO users (email, username, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, username, full_name, role`,
    [email, username, null, username, 'author']
  );

  return inserted.rows[0];
}

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

const magicLinkLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Register (password accounts still supported)
router.post('/register', registerLimiter, async (req, res) => {
  try {
    const { email, username, password, fullName } = req.body;

    if (!email || !username || !password || !fullName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await AuthService.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const user = await AuthService.create({ email, username, password, fullName });
    const token = await issueSession(res, user);

    res.status(201).json({ user, token });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login (password)
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await AuthService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.password_hash) {
      return res.status(401).json({ error: 'This account uses passwordless sign-in' });
    }

    const passwordMatch = await AuthService.comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = await issueSession(res, user);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
});

// Refresh access token (HttpOnly refresh cookie)
router.post('/refresh', authLimiter, async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    const rotated = await AuthService.rotateRefreshToken(raw);
    if (!rotated) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: 'Invalid or expired session' });
    }
    setRefreshCookie(res, rotated.refreshToken);
    const token = AuthService.generateAccessToken(rotated.user);
    res.json({ token });
  } catch (error) {
    clearRefreshCookie(res);
    // eslint-disable-next-line no-console
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

// Logout (revoke refresh cookie)
router.post('/logout', authLimiter, async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    await AuthService.revokeRefreshToken(raw);
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (error) {
    clearRefreshCookie(res);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Magic link: request
router.post('/magic-link/request', magicLinkLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await ensureUserForEmail(email.toLowerCase().trim());

    const token = randomToken(32);
    const tokenHash = sha256Hex(token);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO magic_link_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    const { origin } = getPasskeyRp();
    const link = `${origin.replace(/\/$/, '')}/auth/magic?token=${encodeURIComponent(token)}`;

    // In production you should email this link (SMTP/provider).
    // eslint-disable-next-line no-console
    console.log(`[magic-link] ${email}: ${link}`);

    const mode = process.env.NODE_ENV === 'production' ? 'email' : 'dev-return-link';
    res.json({ ok: true, mode, ...(mode === 'dev-return-link' ? { link } : {}) });
  } catch (error) {
    next(error);
  }
});

// Magic link: verify
router.post('/magic-link/verify', authLimiter, async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token required' });

    const tokenHash = sha256Hex(token);
    const result = await pool.query(
      `SELECT m.id, m.user_id, m.expires_at, m.used_at,
              u.id as uid, u.email, u.username, u.full_name, u.role
       FROM magic_link_tokens m
       JOIN users u ON u.id = m.user_id
       WHERE m.token_hash = $1`,
      [tokenHash]
    );

    if (!result.rows.length) return res.status(401).json({ error: 'Invalid or expired link' });

    const row = result.rows[0];
    if (row.used_at) return res.status(401).json({ error: 'Link already used' });
    if (new Date(row.expires_at).getTime() < Date.now()) return res.status(401).json({ error: 'Link expired' });

    await pool.query('UPDATE magic_link_tokens SET used_at = now() WHERE id = $1', [row.id]);

    const user = {
      id: row.uid,
      email: row.email,
      username: row.username,
      fullName: row.full_name,
      role: row.role,
    };
    const userRow = {
      id: row.uid,
      email: row.email,
      username: row.username,
      role: row.role,
    };
    const tokenJwt = await issueSession(res, userRow);

    res.json({ user, token: tokenJwt });
  } catch (error) {
    next(error);
  }
});

// Passkeys: registration options (requires login)
router.post('/passkeys/register/options', authenticateToken, authLimiter, async (req, res, next) => {
  try {
    const { origin, rpID, rpName } = getPasskeyRp();

    const userRes = await pool.query(
      'SELECT id, email, username, full_name, role FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!userRes.rows.length) return res.status(404).json({ error: 'User not found' });
    const user = userRes.rows[0];

    const existing = await pool.query(
      'SELECT credential_id FROM webauthn_credentials WHERE user_id = $1',
      [user.id]
    );

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: String(user.id),
      userName: user.email,
      userDisplayName: user.full_name || user.username || user.email,
      attestationType: 'none',
      excludeCredentials: existing.rows.map((c) => ({
        id: base64urlToBuffer(c.credential_id),
        type: 'public-key',
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    await pool.query(
      'DELETE FROM auth_challenges WHERE user_id = $1 AND purpose = $2',
      [user.id, 'webauthn_register']
    );
    await pool.query(
      `INSERT INTO auth_challenges (user_id, purpose, challenge, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'webauthn_register', options.challenge, new Date(Date.now() + 5 * 60 * 1000)]
    );

    res.json({ ...options, origin });
  } catch (error) {
    next(error);
  }
});

// Passkeys: registration verify (requires login)
router.post('/passkeys/register/verify', authenticateToken, authLimiter, async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential required' });

    const { origin, rpID } = getPasskeyRp();

    const challengeRes = await pool.query(
      `SELECT challenge, expires_at FROM auth_challenges
       WHERE user_id = $1 AND purpose = $2
       ORDER BY id DESC LIMIT 1`,
      [req.user.id, 'webauthn_register']
    );
    if (!challengeRes.rows.length) return res.status(400).json({ error: 'No registration challenge found' });
    if (new Date(challengeRes.rows[0].expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Registration challenge expired' });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge: challengeRes.rows[0].challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Verification failed' });
    }

    const { credentialID, credentialPublicKey, counter } = verification.registrationInfo;
    const credentialIdB64Url = bufferToBase64url(credentialID);

    await pool.query(
      `INSERT INTO webauthn_credentials
       (user_id, credential_id, public_key, counter, transports, device_type, backed_up)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (credential_id) DO NOTHING`,
      [
        req.user.id,
        credentialIdB64Url,
        Buffer.from(credentialPublicKey),
        counter,
        credential?.response?.transports || null,
        verification.registrationInfo.credentialDeviceType || null,
        Boolean(verification.registrationInfo.credentialBackedUp),
      ]
    );

    await pool.query(
      'DELETE FROM auth_challenges WHERE user_id = $1 AND purpose = $2',
      [req.user.id, 'webauthn_register']
    );

    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

// Passkeys: authentication options (email optional)
router.post('/passkeys/auth/options', authLimiter, async (req, res, next) => {
  try {
    const { email } = req.body || {};
    const { origin, rpID } = getPasskeyRp();

    let allowCredentials;
    if (email) {
      const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
      if (userRes.rows.length) {
        const creds = await pool.query(
          'SELECT credential_id, transports FROM webauthn_credentials WHERE user_id = $1',
          [userRes.rows[0].id]
        );
        if (creds.rows.length) {
          allowCredentials = creds.rows.map((c) => ({
            id: base64urlToBuffer(c.credential_id),
            type: 'public-key',
            transports: c.transports || undefined,
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
      allowCredentials,
    });

    await pool.query(
      `INSERT INTO auth_challenges (user_id, purpose, challenge, expires_at)
       VALUES ($1, $2, $3, $4)`,
      [null, 'webauthn_auth', options.challenge, new Date(Date.now() + 5 * 60 * 1000)]
    );

    res.json({ ...options, origin });
  } catch (error) {
    next(error);
  }
});

// Passkeys: authentication verify -> returns JWT
router.post('/passkeys/auth/verify', authLimiter, async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ error: 'Credential required' });

    const { origin, rpID } = getPasskeyRp();

    const clientData = decodeClientDataJSON(credential?.response?.clientDataJSON);
    const expectedChallenge = clientData?.challenge;
    if (!expectedChallenge) return res.status(400).json({ error: 'Invalid credential payload' });

    const challengeRow = await pool.query(
      `SELECT id, expires_at FROM auth_challenges
       WHERE purpose = $1 AND challenge = $2
       ORDER BY id DESC LIMIT 1`,
      ['webauthn_auth', expectedChallenge]
    );
    if (!challengeRow.rows.length) return res.status(400).json({ error: 'Challenge not found' });
    if (new Date(challengeRow.rows[0].expires_at).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Challenge expired' });
    }

    const credentialIDb64Url = credential.id;
    const stored = await pool.query(
      `SELECT c.*, u.id as uid, u.email, u.username, u.full_name, u.role
       FROM webauthn_credentials c
       JOIN users u ON u.id = c.user_id
       WHERE c.credential_id = $1`,
      [credentialIDb64Url]
    );
    if (!stored.rows.length) return res.status(401).json({ error: 'Unknown credential' });

    const row = stored.rows[0];
    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: base64urlToBuffer(row.credential_id),
        credentialPublicKey: row.public_key,
        counter: row.counter,
        transports: row.transports || undefined,
      },
    });

    if (!verification.verified) return res.status(401).json({ error: 'Verification failed' });

    await pool.query(
      `UPDATE webauthn_credentials
       SET counter = $1, last_used_at = now()
       WHERE id = $2`,
      [verification.authenticationInfo.newCounter, row.id]
    );
    await pool.query('DELETE FROM auth_challenges WHERE id = $1', [challengeRow.rows[0].id]);

    const userRow = {
      id: row.uid,
      email: row.email,
      username: row.username,
      role: row.role,
    };
    const tokenJwt = await issueSession(res, userRow);

    res.json({
      user: { id: row.uid, email: row.email, username: row.username, fullName: row.full_name, role: row.role },
      token: tokenJwt,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, full_name, bio, avatar_url, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;


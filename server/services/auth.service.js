import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool } from '../index.js';

function sha256Hex(s) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function randomRefreshToken() {
  return crypto.randomBytes(32).toString('base64url');
}

export class AuthService {
  static requireJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }
    return secret;
  }

  static accessTokenExpiresIn() {
    return process.env.JWT_ACCESS_EXPIRES_IN || '30m';
  }

  static refreshTokenTtlMs() {
    const days = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '14', 10);
    return Math.min(90, Math.max(1, days)) * 24 * 60 * 60 * 1000;
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /** Short-lived access JWT */
  static generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      this.requireJwtSecret(),
      { expiresIn: this.accessTokenExpiresIn() }
    );
  }

  /** @deprecated Use generateAccessToken */
  static generateToken(user) {
    return this.generateAccessToken(user);
  }

  static async issueRefreshToken(userId) {
    const raw = randomRefreshToken();
    const tokenHash = sha256Hex(raw);
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs());
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
    return raw;
  }

  /**
   * Validates refresh token, revokes it, inserts a new one (rotation).
   * @returns {{ user: object, refreshToken: string } | null}
   */
  static async rotateRefreshToken(raw) {
    if (!raw) return null;
    const tokenHash = sha256Hex(raw);
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const found = await client.query(
        `SELECT id, user_id FROM refresh_tokens
         WHERE token_hash = $1 AND revoked_at IS NULL AND expires_at > now()
         FOR UPDATE`,
        [tokenHash]
      );
      if (!found.rows.length) {
        await client.query('ROLLBACK');
        return null;
      }
      await client.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [
        found.rows[0].id,
      ]);

      const newRaw = randomRefreshToken();
      const newHash = sha256Hex(newRaw);
      const expiresAt = new Date(Date.now() + this.refreshTokenTtlMs());
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, $3)`,
        [found.rows[0].user_id, newHash, expiresAt]
      );
      await client.query('COMMIT');

      const user = await this.findById(found.rows[0].user_id);
      if (!user) return null;
      return { user, refreshToken: newRaw };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async revokeRefreshToken(raw) {
    if (!raw) return;
    const tokenHash = sha256Hex(raw);
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now()
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash]
    );
  }

  static async findById(userId) {
    const result = await pool.query(
      'SELECT id, email, username, full_name, role, created_at FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query(
      'SELECT id, email, username, password_hash, full_name, role, created_at FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { email, username, password, fullName } = userData;
    const passwordHash = await this.hashPassword(password);
    
    const result = await pool.query(
      `INSERT INTO users (email, username, password_hash, full_name, role) 
       VALUES ($1, $2, $3, $4, 'author') RETURNING id, email, username, full_name, role`,
      [email, username, passwordHash, fullName]
    );
    
    return result.rows[0];
  }
}

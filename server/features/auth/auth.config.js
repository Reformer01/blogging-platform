function parseOriginHost(origin) {
  try {
    return new URL(origin).hostname;
  } catch {
    return null;
  }
}

export function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function getAppOrigin() {
  // CLIENT_URL is already used in CORS config; treat it as canonical.
  return process.env.CLIENT_URL || process.env.APP_ORIGIN || 'http://localhost:5173';
}

export function getPasskeyRp() {
  const origin = getAppOrigin();
  const rpID = process.env.PASSKEY_RP_ID || parseOriginHost(origin) || 'localhost';
  const rpName = process.env.PASSKEY_RP_NAME || 'BlogHub';
  return { origin, rpID, rpName };
}


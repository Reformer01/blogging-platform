import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'server', 'migrations');
const SCHEMA_PATH = path.resolve(process.cwd(), 'server', 'database', 'schema.sql');

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

async function ensureMigrationsTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function hasTable(pool, tableName) {
  const res = await pool.query(
    `SELECT to_regclass($1) as reg`,
    [tableName]
  );
  return Boolean(res.rows?.[0]?.reg);
}

async function applySql(pool, filename, sql) {
  await pool.query('BEGIN');
  try {
    await pool.query(sql);
    await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
    await pool.query('COMMIT');
    // eslint-disable-next-line no-console
    console.log(`✓ Applied ${filename}`);
  } catch (err) {
    await pool.query('ROLLBACK');
    // eslint-disable-next-line no-console
    console.error(`✗ Failed ${filename}`);
    throw err;
  }
}

async function main() {
  const connectionString = requireEnv('DATABASE_URL');
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    await ensureMigrationsTable(pool);

    // Bootstrap schema if database is empty (no users table yet).
    const usersExists = await hasTable(pool, 'public.users');
    if (!usersExists) {
      const schemaSql = await fs.readFile(SCHEMA_PATH, 'utf8');
      await applySql(pool, '000_schema.sql', schemaSql);
    }

    const files = (await fs.readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const already = await pool.query('SELECT 1 FROM migrations WHERE filename = $1', [file]);
      if (already.rows.length) continue;
      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
      await applySql(pool, file, sql);
    }

    // eslint-disable-next-line no-console
    console.log('All migrations applied.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


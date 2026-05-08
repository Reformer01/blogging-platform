import express from 'express';
import { pool } from '../index.js';
import { searchRateLimit } from '../middleware/readRateLimits.js';

const router = express.Router();

const perTypeLimit = (rawLimit, type) => {
  const n = parseInt(rawLimit, 10);
  const cap = type === 'all' ? 10 : 20;
  return Math.min(cap, Math.max(1, Number.isFinite(n) ? n : 10));
};

async function searchPosts(q, limit, offset) {
  const result = await pool.query(
    `SELECT 'post' AS type, p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
            p.published_at, u.username, u.full_name
     FROM posts p
     JOIN users u ON p.author_id = u.id
     WHERE p.status = 'published'
       AND p.search_vector @@ plainto_tsquery('english', $1)
     ORDER BY ts_rank_cd(p.search_vector, plainto_tsquery('english', $1)) DESC,
              p.created_at DESC
     LIMIT $2 OFFSET $3`,
    [q, limit, offset]
  );
  return result.rows;
}

async function searchTags(q, limit, offset) {
  const result = await pool.query(
    `SELECT 'tag' AS type, t.id, t.name AS title, t.slug, NULL AS excerpt,
            NULL AS featured_image_url, NULL AS published_at,
            NULL AS username, NULL AS full_name
     FROM tags t
     WHERE t.search_vector @@ plainto_tsquery('simple', $1)
     ORDER BY t.name
     LIMIT $2 OFFSET $3`,
    [q, limit, offset]
  );
  return result.rows;
}

async function searchUsers(q, limit, offset) {
  const result = await pool.query(
    `SELECT 'user' AS type, u.id, u.username AS title, NULL AS slug, u.bio AS excerpt,
            u.avatar_url AS featured_image_url, u.created_at AS published_at,
            u.username, u.full_name
     FROM users u
     WHERE u.search_vector @@ plainto_tsquery('simple', $1)
     ORDER BY u.username
     LIMIT $2 OFFSET $3`,
    [q, limit, offset]
  );
  return result.rows;
}

// Full-text search (parallel per type; no ILIKE UNION)
router.get('/', searchRateLimit, async (req, res, next) => {
  try {
    const { q, type = 'all', page = '1' } = req.query;

    if (!q || String(q).length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const queryStr = String(q).trim();
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limit = perTypeLimit(req.query.limit, type);
    const offset = (pageNum - 1) * limit;

    if (type === 'posts') {
      const rows = await searchPosts(queryStr, limit, offset);
      return res.json(rows);
    }
    if (type === 'tags') {
      const rows = await searchTags(queryStr, limit, offset);
      return res.json(rows);
    }
    if (type === 'users') {
      const rows = await searchUsers(queryStr, limit, offset);
      return res.json(rows);
    }

    const [posts, tags, users] = await Promise.all([
      searchPosts(queryStr, limit, 0),
      searchTags(queryStr, limit, 0),
      searchUsers(queryStr, limit, 0),
    ]);

    res.json([...posts, ...tags, ...users]);
  } catch (error) {
    next(error);
  }
});

export default router;

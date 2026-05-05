import express from 'express';
import { pool } from '../index.js';

const router = express.Router();

// Full-text search
router.get('/', async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({ error: 'Query must be at least 2 characters' });
    }

    const searchTerm = `%${q}%`;

    let query = '';
    if (type === 'posts' || type === 'all') {
      query += `
        SELECT 'post' as type, p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
               p.published_at, u.username, u.full_name
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.status = 'published' AND 
              (p.title ILIKE $1 OR p.excerpt ILIKE $1 OR p.content ILIKE $1)
      `;
    }

    if (type === 'tags' || type === 'all') {
      if (query) query += ' UNION ';
      query += `
        SELECT 'tag' as type, t.id, t.name as title, t.slug, NULL as excerpt, NULL as featured_image_url,
               NULL as published_at, NULL as username, NULL as full_name
        FROM tags t
        WHERE t.name ILIKE $1
      `;
    }

    if (type === 'users' || type === 'all') {
      if (query) query += ' UNION ';
      query += `
        SELECT 'user' as type, u.id, u.username as title, NULL as slug, u.bio as excerpt, u.avatar_url as featured_image_url,
               u.created_at as published_at, u.username, u.full_name
        FROM users u
        WHERE u.username ILIKE $1 OR u.full_name ILIKE $1
      `;
    }

    query += ' LIMIT 20';

    const result = await pool.query(query, [searchTerm]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;

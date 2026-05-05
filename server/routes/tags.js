import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import slugify from 'slugify';

const router = express.Router();

// Get all tags
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.name, t.slug, COUNT(pt.post_id) as post_count
       FROM tags t
       LEFT JOIN post_tags pt ON t.id = pt.tag_id
       GROUP BY t.id
       ORDER BY post_count DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get posts by tag
router.get('/:slug/posts', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
              p.view_count, p.published_at,
              u.username, u.full_name
       FROM posts p
       JOIN users u ON p.author_id = u.id
       JOIN post_tags pt ON p.id = pt.post_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE t.slug = $1 AND p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.slug, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as count
       FROM posts p
       JOIN post_tags pt ON p.id = pt.post_id
       JOIN tags t ON pt.tag_id = t.id
       WHERE t.slug = $1 AND p.status = 'published'`,
      [req.params.slug]
    );

    res.json({
      posts: result.rows,
      total: parseInt(countResult.rows[0].count),
      page,
      limit,
      pages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Create tag (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const result = await pool.query(
      `INSERT INTO tags (name, slug) VALUES ($1, $2)
       RETURNING id, name, slug`,
      [name, slug]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Tag already exists' });
    }
    next(error);
  }
});

export default router;

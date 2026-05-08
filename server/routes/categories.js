import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import slugify from 'slugify';
import { readRateLimit } from '../middleware/readRateLimits.js';
import { categoriesLru, invalidateCategoriesCache } from '../shared/cache.js';

const router = express.Router();

// Get all categories
router.get('/', readRateLimit, async (req, res, next) => {
  try {
    const hit = categoriesLru.get('all');
    if (hit) return res.json(hit);

    const result = await pool.query(
      `SELECT c.id, c.name, c.slug, c.description,
              COUNT(pc.post_id) as post_count
       FROM categories c
       LEFT JOIN post_categories pc ON c.id = pc.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );
    categoriesLru.set('all', result.rows);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get posts by category
router.get('/:slug/posts', readRateLimit, async (req, res, next) => {
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
       JOIN post_categories pc ON p.id = pc.post_id
       JOIN categories c ON pc.category_id = c.id
       WHERE c.slug = $1 AND p.status = 'published'
       ORDER BY p.published_at DESC
       LIMIT $2 OFFSET $3`,
      [req.params.slug, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as count
       FROM posts p
       JOIN post_categories pc ON p.id = pc.post_id
       JOIN categories c ON pc.category_id = c.id
       WHERE c.slug = $1 AND p.status = 'published'`,
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

// Create category (admin only)
router.post('/', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description)
       VALUES ($1, $2, $3)
       RETURNING id, name, slug, description`,
      [name, slug, description]
    );

    invalidateCategoriesCache();
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    next(error);
  }
});

export default router;

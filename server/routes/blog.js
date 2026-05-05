import express from 'express';
import { pool } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';
import slugify from 'slugify';

const router = express.Router();

// Get all published posts with pagination
router.get('/posts', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.slug, p.excerpt, p.featured_image_url,
        p.view_count, p.published_at, p.created_at,
        u.username, u.full_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.status = 'published'
      ORDER BY p.published_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM posts WHERE status = $1',
      ['published']
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

// Get single post by slug
router.get('/posts/:slug', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT 
        p.id, p.title, p.content, p.slug, p.featured_image_url,
        p.view_count, p.published_at, p.created_at,
        u.id as author_id, u.username, u.full_name, u.bio, u.avatar_url
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.slug = $1 AND p.status = 'published'`,
      [req.params.slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Increment view count
    await pool.query('UPDATE posts SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]);

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get user's posts (drafts + published)
router.get('/my-posts', authenticateToken, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, status, published_at, created_at, updated_at
       FROM posts
       WHERE author_id = $1
       ORDER BY updated_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create new post
router.post('/posts', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, excerpt, featuredImageUrl, status = 'draft' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const slug = slugify(title, { lower: true, strict: true });
    const publishedAt = status === 'published' ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO posts (author_id, title, slug, content, excerpt, featured_image_url, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, slug, status, created_at`,
      [req.user.id, title, slug, content, excerpt, featuredImageUrl, status, publishedAt]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'A post with this title already exists' });
    }
    next(error);
  }
});

// Update post
router.put('/posts/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, featuredImageUrl, status } = req.body;

    // Check ownership
    const postCheck = await pool.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0 || postCheck.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const publishedAt = status === 'published' ? new Date() : null;

    const result = await pool.query(
      `UPDATE posts 
       SET title = $1, content = $2, excerpt = $3, featured_image_url = $4, status = $5, published_at = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, title, slug, status, updated_at`,
      [title, content, excerpt, featuredImageUrl, status, publishedAt, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete post
router.delete('/posts/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const postCheck = await pool.query('SELECT author_id FROM posts WHERE id = $1', [id]);
    if (postCheck.rows.length === 0 || postCheck.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

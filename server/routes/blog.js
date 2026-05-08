import express from 'express';
import { pool } from '../index.js';
import { BlogService } from '../services/blog.service.js';
import { authenticateToken } from '../middleware/auth.js';
import { readRateLimit } from '../middleware/readRateLimits.js';
import { bumpFeedCache, feedLru } from '../shared/cache.js';

const router = express.Router();

// Get all published posts with pagination
router.get('/posts', readRateLimit, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 10);

    const posts = await BlogService.getPosts(page, limit);
    const total = await BlogService.countPublished();

    res.json({
      posts,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// Get single post by slug
router.get('/posts/:slug', readRateLimit, async (req, res, next) => {
  try {
    const post = await BlogService.getPostBySlug(req.params.slug);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    next(error);
  }
});

// Get user's posts (drafts + published)
router.get('/my-posts', authenticateToken, async (req, res, next) => {
  try {
    const rows = await BlogService.listMyPostsAll(req.user.id);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// Create new post
router.post('/posts', authenticateToken, async (req, res, next) => {
  try {
    const { title, content, excerpt, featuredImageUrl, status = 'draft' } = req.body;
    const authorId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const post = await BlogService.createPost(
      { title, content, excerpt, featuredImageUrl, status },
      authorId
    );

    res.status(201).json(post);
  } catch (error) {
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

    bumpFeedCache();
    feedLru.clear();

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

    bumpFeedCache();
    feedLru.clear();

    res.json({ message: 'Post deleted' });
  } catch (error) {
    next(error);
  }
});

export default router;

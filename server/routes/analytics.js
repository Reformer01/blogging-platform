import express from 'express';
import { pool } from '../index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get post analytics for author
router.get('/posts/:postId', authenticateToken, async (req, res, next) => {
  try {
    const { postId } = req.params;

    // Verify ownership
    const postCheck = await pool.query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postCheck.rows.length === 0 || postCheck.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = await Promise.all([
      // View count
      pool.query('SELECT view_count FROM posts WHERE id = $1', [postId]),
      // Comments count
      pool.query('SELECT COUNT(*) FROM comments WHERE post_id = $1', [postId]),
      // Approved comments
      pool.query(
        'SELECT COUNT(*) FROM comments WHERE post_id = $1 AND status = \'approved\'',
        [postId]
      ),
    ]);

    res.json({
      views: parseInt(stats[0].rows[0].view_count),
      total_comments: parseInt(stats[1].rows[0].count),
      approved_comments: parseInt(stats[2].rows[0].count),
    });
  } catch (error) {
    next(error);
  }
});

// Get author analytics
router.get('/author', authenticateToken, async (req, res, next) => {
  try {
    const stats = await Promise.all([
      // Total posts
      pool.query('SELECT COUNT(*) FROM posts WHERE author_id = $1 AND status = \'published\'', [
        req.user.id,
      ]),
      // Total views
      pool.query(
        'SELECT SUM(view_count) as total_views FROM posts WHERE author_id = $1 AND status = \'published\'',
        [req.user.id]
      ),
      // Top posts
      pool.query(
        `SELECT id, title, view_count FROM posts 
         WHERE author_id = $1 AND status = 'published'
         ORDER BY view_count DESC LIMIT 5`,
        [req.user.id]
      ),
      // Recent comments
      pool.query(
        `SELECT c.id, c.content, u.username, p.title
         FROM comments c
         JOIN posts p ON c.post_id = p.id
         JOIN users u ON c.author_id = u.id
         WHERE p.author_id = $1
         ORDER BY c.created_at DESC LIMIT 10`,
        [req.user.id]
      ),
    ]);

    res.json({
      total_posts: parseInt(stats[0].rows[0].count),
      total_views: parseInt(stats[1].rows[0].total_views) || 0,
      top_posts: stats[2].rows,
      recent_comments: stats[3].rows,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

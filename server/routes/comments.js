import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get comments for a post
router.get('/posts/:postId', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.status, c.created_at,
              u.id as author_id, u.username, u.avatar_url
       FROM comments c
       JOIN users u ON c.author_id = u.id
       WHERE c.post_id = $1 AND c.status = 'approved'
       ORDER BY c.created_at DESC`,
      [req.params.postId]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create comment
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { postId, content } = req.body;

    if (!content || !postId) {
      return res.status(400).json({ error: 'Post ID and content required' });
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, author_id, content, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING id, content, status, created_at`,
      [postId, req.user.id, content]
    );

    res.status(201).json({ ...result.rows[0], message: 'Comment submitted for approval' });
  } catch (error) {
    next(error);
  }
});

// Delete comment (owner or admin)
router.delete('/:id', authenticateToken, async (req, res, next) => {
  try {
    const commentCheck = await pool.query(
      'SELECT author_id FROM comments WHERE id = $1',
      [req.params.id]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (commentCheck.rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [req.params.id]);
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
});

// Moderate comment (admin only)
router.patch('/:id/moderate', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await pool.query(
      'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get pending comments (admin only)
router.get('/admin/pending', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.content, c.created_at,
              u.username, p.title,
              c.post_id
       FROM comments c
       JOIN users u ON c.author_id = u.id
       JOIN posts p ON c.post_id = p.id
       WHERE c.status = 'pending'
       ORDER BY c.created_at ASC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

export default router;

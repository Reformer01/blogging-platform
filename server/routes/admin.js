import express from 'express';
import { pool } from '../index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard stats (admin only)
router.get('/stats', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const stats = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM posts WHERE status = $1', ['published']),
      pool.query('SELECT SUM(view_count) as total_views FROM posts'),
      pool.query(`SELECT id, title, view_count FROM posts ORDER BY view_count DESC LIMIT 5`),
    ]);

    res.json({
      totalUsers: parseInt(stats[0].rows[0].count),
      totalPosts: parseInt(stats[1].rows[0].count),
      totalViews: parseInt(stats[2].rows[0].total_views) || 0,
      topPosts: stats[3].rows,
    });
  } catch (error) {
    next(error);
  }
});

// Get all users (admin only)
router.get('/users', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, username, full_name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get all posts (admin only)
router.get('/posts', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.title, p.status, p.view_count, p.published_at, u.username
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Moderate comment
router.patch('/comments/:id', authenticateToken, authorizeRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const result = await pool.query(
      'UPDATE comments SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;

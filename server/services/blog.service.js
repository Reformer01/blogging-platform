import { pool } from '../index.js';
import slugify from 'slugify';
import { bumpFeedCache, feedCacheKey, feedLru } from '../shared/cache.js';

const pendingViews = new Map();
let flushTimer = null;

function scheduleViewFlush() {
  if (flushTimer) return;
  const ms = Math.min(30000, Math.max(5000, parseInt(process.env.VIEW_COUNT_FLUSH_MS || '20000', 10)));
  flushTimer = setTimeout(async () => {
    flushTimer = null;
    await BlogService.flushViewCounts();
  }, ms);
  if (typeof flushTimer.unref === 'function') flushTimer.unref();
}

export class BlogService {
  static async createPost(postData, authorId) {
    const { title, content, excerpt, featuredImageUrl, status = 'draft' } = postData;
    const slug = slugify(title, { lower: true, strict: true });
    const publishedAt = status === 'published' ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO posts (author_id, title, slug, content, excerpt, featured_image_url, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [authorId, title, slug, content, excerpt, featuredImageUrl, status, publishedAt]
    );

    bumpFeedCache();
    feedLru.clear();

    return result.rows[0];
  }

  static async updatePost(postId, postData, authorId) {
    const { title, content, excerpt, featuredImageUrl, status } = postData;
    const slug = slugify(title, { lower: true, strict: true });

    const result = await pool.query(
      `UPDATE posts
       SET title = $1, slug = $2, content = $3, excerpt = $4, featured_image_url = $5, status = $6, updated_at = NOW()
       WHERE id = $7 AND author_id = $8 RETURNING *`,
      [title, slug, content, excerpt, featuredImageUrl, status, postId, authorId]
    );

    bumpFeedCache();
    feedLru.clear();

    return result.rows[0];
  }

  static async deletePost(postId, authorId) {
    const result = await pool.query(
      'DELETE FROM posts WHERE id = $1 AND author_id = $2 RETURNING *',
      [postId, authorId]
    );

    bumpFeedCache();
    feedLru.clear();

    return result.rows[0];
  }

  static async getPostBySlug(slug) {
    const result = await pool.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.slug = $1 AND p.status = 'published'`,
      [slug]
    );

    if (result.rows[0]) {
      this.queueViewIncrement(result.rows[0].id);
    }

    return result.rows[0];
  }

  static queueViewIncrement(postId) {
    const id = Number(postId);
    pendingViews.set(id, (pendingViews.get(id) || 0) + 1);
    scheduleViewFlush();
  }

  static async flushViewCounts() {
    if (pendingViews.size === 0) return;

    const entries = [...pendingViews.entries()];
    pendingViews.clear();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [postId, delta] of entries) {
        await client.query(
          'UPDATE posts SET view_count = view_count + $1 WHERE id = $2',
          [delta, postId]
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      for (const [postId, delta] of entries) {
        pendingViews.set(postId, (pendingViews.get(postId) || 0) + delta);
      }
      throw e;
    } finally {
      client.release();
    }
  }

  static async countPublished() {
    const countResult = await pool.query(
      'SELECT COUNT(*)::int AS count FROM posts WHERE status = $1',
      ['published']
    );
    return countResult.rows[0].count;
  }

  static async getPosts(page = 1, limit = 10, status = 'published') {
    const key = feedCacheKey(page, limit);
    const cached = feedLru.get(key);
    if (cached && status === 'published') {
      return cached;
    }

    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.status = $1
       ORDER BY p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [status, limit, offset]
    );

    const rows = result.rows;
    if (status === 'published') {
      feedLru.set(key, rows);
    }
    return rows;
  }

  static async getMyPosts(authorId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT * FROM posts
       WHERE author_id = $1
       ORDER BY updated_at DESC
       LIMIT $2 OFFSET $3`,
      [authorId, limit, offset]
    );

    return result.rows;
  }

  static async listMyPostsAll(authorId) {
    const result = await pool.query(
      `SELECT id, title, slug, excerpt, status, published_at, created_at, updated_at
       FROM posts
       WHERE author_id = $1
       ORDER BY updated_at DESC`,
      [authorId]
    );
    return result.rows;
  }

  static async getAllPosts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.author_id = u.id
       ORDER BY p.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  /** @deprecated Prefer SearchService / GET /api/search */
  static async searchPosts(query, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const result = await pool.query(
      `SELECT p.*, u.username, u.full_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.author_id = u.id
       WHERE p.status = 'published'
         AND p.search_vector @@ plainto_tsquery('english', $1)
       ORDER BY ts_rank_cd(p.search_vector, plainto_tsquery('english', $1)) DESC, p.created_at DESC
       LIMIT $2 OFFSET $3`,
      [query, limit, offset]
    );
    return result.rows;
  }
}

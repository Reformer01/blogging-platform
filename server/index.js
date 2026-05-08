import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { Pool } from 'pg';
import authRoutes from './routes/auth.js';
import blogRoutes from './routes/blog.js';
import adminRoutes from './routes/admin.js';
import tagsRoutes from './routes/tags.js';
import categoriesRoutes from './routes/categories.js';
import commentsRoutes from './routes/comments.js';
import searchRoutes from './routes/search.js';
import analyticsRoutes from './routes/analytics.js';
import emailRoutes from './routes/email.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { metricsMiddleware, metricsHandler } from './middleware/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.PGPOOL_MAX || '20', 10),
  idleTimeoutMillis: parseInt(process.env.PGPOOL_IDLE_MS || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.PGPOOL_CONN_TIMEOUT_MS || '5000', 10),
});

const jsonSmall = express.json({ limit: '100kb' });
const jsonLarge = express.json({ limit: '10mb' });

function bodyParserConditional(req, res, next) {
  const p = req.path;
  if (p === '/api/blog/posts' && req.method === 'POST') {
    return jsonLarge(req, res, next);
  }
  if (p.startsWith('/api/blog/posts/') && req.method === 'PUT') {
    return jsonLarge(req, res, next);
  }
  return jsonSmall(req, res, next);
}

// Security & logging middleware
app.use(helmet());
app.use(requestIdMiddleware);
app.use(metricsMiddleware);
morgan.token('request-id', (req) => req.id || '-');
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :request-id')
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParserConditional);
app.use(express.urlencoded({ limit: '100kb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailRoutes);

// Health check (includes DB readiness)
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: true });
  } catch {
    res.status(503).json({ status: 'unhealthy', db: false });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'live' });
});

if (process.env.ENABLE_METRICS === '1') {
  app.get('/metrics', metricsHandler);
}

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  try {
    const { BlogService } = await import('./services/blog.service.js');
    await BlogService.flushViewCounts();
  } catch {
    /* ignore */
  }
  await pool.end();
  process.exit(0);
});

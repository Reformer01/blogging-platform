import rateLimit from 'express-rate-limit';

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_SEARCH_PER_MIN || '30', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many search requests' },
});

export const readRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: parseInt(process.env.RATE_LIMIT_READ_PER_MIN || '200', 10),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests' },
});

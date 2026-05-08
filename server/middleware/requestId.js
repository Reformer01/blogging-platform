import { randomUUID } from 'node:crypto';

export function requestIdMiddleware(req, res, next) {
  const id = req.get('X-Request-Id') || randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}

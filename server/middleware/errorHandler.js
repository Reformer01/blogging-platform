export const errorHandler = (err, req, res, next) => {
  const rid = req.id || req.headers['x-request-id'];
  console.error(rid ? `[${rid}] Error:` : 'Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }

  if (err.status === 404) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
};

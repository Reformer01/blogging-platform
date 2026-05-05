-- Add tags table
CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add post_tags junction table
CREATE TABLE post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Add scheduled_at column to posts
ALTER TABLE posts ADD COLUMN scheduled_at TIMESTAMP;

-- Add reading_time to posts
ALTER TABLE posts ADD COLUMN reading_time_minutes INTEGER;

-- Update comments status options
ALTER TABLE comments DROP COLUMN status;
ALTER TABLE comments ADD COLUMN status VARCHAR(50) DEFAULT 'pending';

-- Create indexes
CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_post_tags ON post_tags(tag_id);

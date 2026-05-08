-- Scale: composite indexes, junction indexes, full-text search (runs after add_features.sql)

-- Published feed + author dashboards
CREATE INDEX IF NOT EXISTS idx_posts_status_created_at ON posts (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_updated_at ON posts (author_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_status_view_count ON posts (author_id, status, view_count DESC NULLS LAST);

-- Comments listing by post + status
CREATE INDEX IF NOT EXISTS idx_comments_post_status_created ON comments (post_id, status, created_at DESC);

-- Junction tables (tag/category filtered post lists)
CREATE INDEX IF NOT EXISTS idx_post_tags_tag_post ON post_tags (tag_id, post_id);
CREATE INDEX IF NOT EXISTS idx_post_categories_cat_post ON post_categories (category_id, post_id);

-- Full-text: posts (english on title + excerpt + content)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A')
    || setweight(to_tsvector('english', coalesce(excerpt, '')), 'B')
    || setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);

-- Tags: simple tokenizer for names
ALTER TABLE tags ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(name, ''))) STORED;

CREATE INDEX IF NOT EXISTS idx_tags_search_vector ON tags USING GIN (search_vector);

-- Users: username + display name
ALTER TABLE users ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(username, '') || ' ' || coalesce(full_name, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_users_search_vector ON users USING GIN (search_vector);

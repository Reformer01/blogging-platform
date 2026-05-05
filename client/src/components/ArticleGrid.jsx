import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';
import Badge from './Badge';
import Avatar from './Avatar';

/**
 * ArticleGrid Component
 * Bento layout with grid-flow-dense (zero empty cells)
 * Automatically determines card sizes based on article index
 */
const ArticleGrid = ({ articles = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-700 rounded-lg animate-pulse h-64" />
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">No articles found</p>
      </div>
    );
  }

  // Determine grid span based on article index
  // Creates bento pattern: large, large, medium, medium, medium, medium
  const getGridSpan = (index) => {
    if (index === 0) return 'md:col-span-2 md:row-span-2';
    if (index === 1) return 'md:col-span-1 md:row-span-2';
    return 'md:col-span-1 md:row-span-1';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max grid-flow-dense">
      {articles.map((article, index) => (
        <Card
          key={article.id || index}
          className={`overflow-hidden ${getGridSpan(index)}`}
          hoverable
        >
          {/* Featured Image */}
          <div className="relative w-full h-full min-h-48 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
            <img
              src={
                article.featured_image ||
                `https://picsum.photos/seed/${article.slug || article.id}/800/600`
              }
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

            {/* Content Overlay */}
            <div className="absolute inset-0 p-4 md:p-6 flex flex-col justify-end">
              {/* Status Badge */}
              {article.status && (
                <div className="mb-3">
                  <Badge
                    status={article.status === 'published' ? 'published' : 'draft'}
                  >
                    {article.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              )}

              {/* Title */}
              <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-3">
                {article.title}
              </h3>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>
              )}

              {/* Footer: Author + Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {article.author && (
                    <>
                      <Avatar
                        alt={article.author.username}
                        size="sm"
                      />
                      <div className="text-xs">
                        <p className="text-slate-200 font-medium">
                          {article.author.username}
                        </p>
                        {article.created_at && (
                          <p className="text-slate-400 text-xs">
                            {new Date(article.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* View Count */}
                {article.view_count !== undefined && (
                  <p className="text-xs font-mono text-slate-400">
                    {article.view_count} views
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

ArticleGrid.propTypes = {
  articles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      slug: PropTypes.string,
      title: PropTypes.string.isRequired,
      excerpt: PropTypes.string,
      featured_image: PropTypes.string,
      status: PropTypes.string,
      author: PropTypes.shape({
        username: PropTypes.string,
      }),
      created_at: PropTypes.string,
      view_count: PropTypes.number,
    })
  ),
  isLoading: PropTypes.bool,
};

export default ArticleGrid;

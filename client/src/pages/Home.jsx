import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ArrowRight, Search } from 'lucide-react';

function Home() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [page, search]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/blog/posts', {
        params: { page, limit: 10, q: search },
      });
      setPosts(res.data.posts);
      setTotal(res.data.total);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="hero py-20 text-center text-white">
        <h1 className="text-5xl font-bold mb-6">Blogging Platform</h1>
        <p className="text-xl text-slate-300 mb-8">
          Share your thoughts, ideas, and stories with the world
        </p>
        <Link
          to="/editor"
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition"
        >
          Start Writing
        </Link>
      </section>

      {/* Search Section */}
      <section className="max-w-6xl mx-auto px-4 mb-12">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-700 text-white pl-12 pr-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center text-slate-300">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-slate-300">No posts found</div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-slate-700 rounded-lg overflow-hidden hover:shadow-xl transition group"
              >
                {post.featured_image_url && (
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
                    <span>{post.username}</span>
                    <span>{formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}</span>
                  </div>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition"
                  >
                    Read More <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="flex justify-center gap-4 mt-12">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-white">{page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page * 10 >= total}
              className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;

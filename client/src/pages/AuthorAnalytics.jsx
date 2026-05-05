import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../store/authStore';
import toast from 'react-hot-toast';
import { BarChart3, Eye, MessageSquare } from 'lucide-react';

function AuthorAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/analytics/author');
      setAnalytics(res.data);
    } catch (error) {
      toast.error('Error loading analytics');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!analytics) return null;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <BarChart3 className="w-8 h-8" /> Your Analytics
        </h1>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Total Posts</p>
            <p className="text-4xl font-bold">{analytics.total_posts}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-400" />
              <p className="text-slate-400 text-sm">Total Views</p>
            </div>
            <p className="text-4xl font-bold">{analytics.total_views.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-green-400" />
              <p className="text-slate-400 text-sm">Comments</p>
            </div>
            <p className="text-4xl font-bold">{analytics.recent_comments.length}</p>
          </div>
        </div>

        {/* Top posts */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Top Posts</h2>
          <div className="space-y-3">
            {analytics.top_posts.length === 0 ? (
              <p className="text-slate-400">No published posts yet</p>
            ) : (
              analytics.top_posts.map((post) => (
                <div key={post.id} className="flex justify-between items-center pb-3 border-b border-slate-700">
                  <span>{post.title}</span>
                  <span className="text-blue-400 font-semibold flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {post.view_count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent comments */}
        <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Recent Comments</h2>
          <div className="space-y-4">
            {analytics.recent_comments.length === 0 ? (
              <p className="text-slate-400">No comments yet</p>
            ) : (
              analytics.recent_comments.map((comment) => (
                <div key={comment.id} className="pb-4 border-b border-slate-700">
                  <p className="text-blue-400 text-sm">{comment.username} on "{comment.title}"</p>
                  <p className="text-slate-300">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthorAnalytics;

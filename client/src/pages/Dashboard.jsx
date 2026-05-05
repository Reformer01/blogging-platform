import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/blog/my-posts');
      setPosts(res.data);
    } catch (error) {
      toast.error('Error loading posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await API.delete(`/blog/posts/${id}`);
      setPosts(posts.filter((p) => p.id !== id));
      toast.success('Post deleted');
    } catch (error) {
      toast.error('Error deleting post');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Posts</h1>
          <Link
            to="/editor"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded font-medium transition"
          >
            + New Post
          </Link>
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="text-center text-slate-400">
            No posts yet. <Link to="/editor" className="text-blue-400">Create one now</Link>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="text-left px-6 py-4">Title</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Updated</th>
                  <th className="text-right px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-slate-700 hover:bg-slate-700">
                    <td className="px-6 py-4">{post.title}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          post.status === 'published'
                            ? 'bg-green-900 text-green-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}
                      >
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatDistanceToNow(new Date(post.updated_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        to={`/editor/${post.id}`}
                        className="inline-flex items-center text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      {post.status === 'published' && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-green-400 hover:text-green-300"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;

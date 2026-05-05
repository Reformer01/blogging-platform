import React, { useState, useEffect } from 'react';
import API from '../store/authStore';
import toast from 'react-hot-toast';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'stats') {
        const res = await API.get('/admin/stats');
        setStats(res.data);
      } else if (activeTab === 'users') {
        const res = await API.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'posts') {
        const res = await API.get('/admin/posts');
        setPosts(res.data);
      }
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          {['stats', 'users', 'posts'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded font-medium transition ${
                activeTab === tab
                  ? 'bg-blue-600'
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : activeTab === 'stats' && stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-3xl font-bold">{stats.totalUsers}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-400 text-sm">Total Posts</p>
              <p className="text-3xl font-bold">{stats.totalPosts}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
              <p className="text-slate-400 text-sm">Total Views</p>
              <p className="text-3xl font-bold">{stats.totalViews}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg col-span-1 md:col-span-4">
              <h3 className="text-lg font-bold mb-4">Top Posts</h3>
              <ul className="space-y-2">
                {stats.topPosts.map((post) => (
                  <li key={post.id} className="flex justify-between">
                    <span>{post.title}</span>
                    <span className="text-slate-400">{post.view_count} views</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left px-6 py-4">Username</th>
                  <th className="text-left px-6 py-4">Email</th>
                  <th className="text-left px-6 py-4">Role</th>
                  <th className="text-left px-6 py-4">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-700">
                    <td className="px-6 py-4">{user.username}</td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4"><span className="bg-blue-900 px-2 py-1 rounded text-sm">{user.role}</span></td>
                    <td className="px-6 py-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="text-left px-6 py-4">Title</th>
                  <th className="text-left px-6 py-4">Author</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Views</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t border-slate-700">
                    <td className="px-6 py-4">{post.title}</td>
                    <td className="px-6 py-4">{post.username}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-sm ${
                      post.status === 'published' ? 'bg-green-900' : 'bg-yellow-900'
                    }`}>{post.status}</span></td>
                    <td className="px-6 py-4">{post.view_count}</td>
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

export default AdminDashboard;

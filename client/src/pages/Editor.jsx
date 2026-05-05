import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import API from '../store/authStore';
import toast from 'react-hot-toast';
import 'react-quill/dist/quill.snow.css';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/blog/my-posts`);
      const post = res.data.find((p) => p.id === parseInt(id));
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt);
        setStatus(post.status);
      }
    } catch (error) {
      toast.error('Error loading post');
    }
  };

  const handleSave = async (publishStatus) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      if (id) {
        await API.put(`/blog/posts/${id}`, {
          title,
          content,
          excerpt,
          featuredImageUrl: featuredImage,
          status: publishStatus || status,
        });
        toast.success('Post updated');
      } else {
        await API.post('/blog/posts', {
          title,
          content,
          excerpt,
          featuredImageUrl: featuredImage,
          status: publishStatus || status,
        });
        toast.success('Post created');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold">
            {id ? 'Edit Post' : 'Write New Post'}
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-400 hover:text-white"
          >
            ← Back
          </button>
        </div>

        <div className="bg-slate-800 rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title..."
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Brief summary of your post..."
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-blue-500 h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Featured Image URL</label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full bg-slate-700 text-white px-4 py-3 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              className="bg-white rounded"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleSave('draft')}
              disabled={loading}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded font-medium transition disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSave('published')}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-medium transition disabled:opacity-50"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import API from '../store/authStore';
import toast from 'react-hot-toast';
import { Eye } from 'lucide-react';
import 'react-quill/dist/quill.snow.css';

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTags();
    if (id) {
      fetchPost();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await API.get('/tags');
      setTags(res.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const res = await API.get(`/blog/my-posts`);
      const post = res.data.find((p) => p.id === parseInt(id));
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt);
        setStatus(post.status);
        setSelectedCategories(post.categories || []);
        setSelectedTags(post.tags || []);
        if (post.scheduled_at) {
          setScheduledAt(post.scheduled_at.substring(0, 16));
        }
      }
    } catch (error) {
      toast.error('Error loading post');
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    if (selectedTags.find((t) => t.name === newTag)) {
      toast.error('Tag already added');
      return;
    }
    setSelectedTags([...selectedTags, { name: newTag }]);
    setNewTag('');
  };

  const handleSave = async (publishStatus) => {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    try {
      const postData = {
        title,
        content,
        excerpt,
        featuredImageUrl: featuredImage,
        status: publishStatus || status,
        categoryIds: selectedCategories.map((c) => c.id || c),
        tags: selectedTags.map((t) => t.name || t),
        scheduledAt: scheduledAt || null,
      };

      if (id) {
        await API.put(`/blog/posts/${id}`, postData);
        toast.success('Post updated');
      } else {
        await API.post('/blog/posts', postData);
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
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
            >
              <Eye className="w-4 h-4" /> {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-slate-400 hover:text-white"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
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
                {!showPreview ? (
                  <ReactQuill
                    value={content}
                    onChange={setContent}
                    theme="snow"
                    className="bg-white rounded"
                  />
                ) : (
                  <div className="prose prose-invert max-w-none bg-slate-700 p-6 rounded">
                    <div dangerouslySetInnerHTML={{ __html: content }} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-6 space-y-6 sticky top-6">
              <div>
                <label className="block text-sm font-medium mb-3">Categories</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCategories.some((c) => c.id === cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCategories([...selectedCategories, cat]);
                          } else {
                            setSelectedCategories(
                              selectedCategories.filter((c) => c.id !== cat.id)
                            );
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{cat.name}</span>
                      <span className="text-xs text-slate-500">({cat.post_count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="Add tag..."
                    className="flex-1 bg-slate-700 text-white px-3 py-2 rounded text-sm"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm transition"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, idx) => (
                    <div
                      key={idx}
                      className="bg-blue-600 px-3 py-1 rounded text-sm flex items-center gap-2"
                    >
                      {tag.name || tag}
                      <button
                        onClick={() =>
                          setSelectedTags(selectedTags.filter((_, i) => i !== idx))
                        }
                        className="hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Schedule Post</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-700">
                <button
                  onClick={() => handleSave('draft')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded font-medium transition disabled:opacity-50 text-sm"
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave('published')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-medium transition disabled:opacity-50 text-sm"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Editor;

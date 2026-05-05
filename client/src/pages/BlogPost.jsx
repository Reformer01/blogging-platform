import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import API from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      const res = await API.get(`/blog/posts/${slug}`);
      setPost(res.data);
      document.title = res.data.title;
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!post) {
    return <div className="text-center py-20">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <a
          href="/"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </a>

        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg mb-8"
          />
        )}

        <header className="mb-8 border-b border-slate-700 pb-8">
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-slate-400">
            {post.avatar_url && (
              <img
                src={post.avatar_url}
                alt={post.full_name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <p className="text-white font-semibold">{post.full_name || post.username}</p>
              <p className="text-sm">
                {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
              </p>
            </div>
            <span className="ml-auto text-sm">{post.view_count} views</span>
          </div>
        </header>

        <div className="prose prose-invert max-w-none mb-12">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">About the Author</h3>
          <p className="text-slate-300">{post.bio || 'No bio available'}</p>
        </div>
      </article>
    </div>
  );
}

export default BlogPost;

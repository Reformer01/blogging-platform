import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import API from '../store/authStore';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Send } from 'lucide-react';

function CommentSection({ postId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const res = await API.get(`/comments/posts/${postId}`);
      setComments(res.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await API.post('/comments', {
        postId,
        content: newComment,
      });
      toast.success('Comment submitted for approval');
      setNewComment('');
      // Refresh comments
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error posting comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  return (
    <div className="mt-12 border-t border-slate-700 pt-8">
      <h3 className="text-2xl font-bold text-white mb-6">Comments ({comments.length})</h3>

      {/* Comment form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts..."
            rows="4"
            className="w-full bg-slate-800 text-white px-4 py-3 rounded border border-slate-700 focus:outline-none focus:border-blue-500 mb-4"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Post Comment
          </button>
        </form>
      ) : (
        <p className="text-slate-400 mb-8">
          <a href="/login" className="text-blue-400 hover:text-blue-300">
            Login
          </a>
          {' '}to post a comment
        </p>
      )}

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-slate-400">No comments yet. Be the first!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-slate-800 p-4 rounded">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {comment.avatar_url && (
                    <img
                      src={comment.avatar_url}
                      alt={comment.username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div>
                    <p className="text-white font-semibold">{comment.username}</p>
                    <p className="text-xs text-slate-400">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-slate-300">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default CommentSection;

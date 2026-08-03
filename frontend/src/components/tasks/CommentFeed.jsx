import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/apiClient';

export default function CommentFeed({ taskId }) {
  const comments = useTaskStore((state) => state.comments);
  const fetchComments = useTaskStore((state) => state.fetchComments);
  const addComment = useTaskStore((state) => state.addComment);
  const updateComment = useTaskStore((state) => state.updateComment);
  const deleteComment = useTaskStore((state) => state.deleteComment);
  const user = useAuthStore((state) => state.user);

  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchComments(taskId);
  }, [taskId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsLoading(true);
    try {
      await addComment(taskId, commentText.trim());
      setCommentText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      await updateComment(commentId, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update comment.');
    }
  };

  const handleDelete = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete comment.');
      }
    }
  };

  return (
    <div className="space-y-6 text-sm font-semibold">
      <div className="flex items-center space-x-2 border-b border-slateDark-900 pb-4 select-none">
        <span className="text-lg">💬</span>
        <h3 className="font-bold text-white text-base">Discussion Comments</h3>
        <span className="px-2.5 py-0.5 bg-slateDark-900 border border-slateDark-800 text-slateDark-400 rounded-full text-xs font-mono font-bold">
          {comments.length}
        </span>
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows="3"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Ask a question or post an update..."
          className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none placeholder-slateDark-600 resize-none"
        />
        <div className="flex justify-end select-none">
          <button
            type="submit"
            disabled={isLoading || !commentText.trim()}
            className="px-5 py-2 bg-brand-600 hover:bg-brand-500 border border-brand-500 text-white text-xs font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((c) => {
          const isOwner = c.employeeId === user?.employeeId;
          const isAdmin = user?.role === 'ADMIN';
          const canDelete = isOwner || isAdmin;

          return (
            <div
              key={c.id}
              className="p-4 bg-slateDark-900/40 border border-slateDark-900 rounded-xl flex items-start space-x-4 hover:border-slateDark-800/80 transition-colors animate-fade-in"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm uppercase select-none flex-shrink-0">
                {c.employee?.avatar ? (
                  <img
                    src={`${apiClient.defaults.baseURL || ''}${c.employee.avatar}`}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  c.employee?.firstName?.charAt(0)
                )}
              </div>

              {/* Comment Content */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between select-none">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-xs">
                      {c.employee?.firstName} {c.employee?.lastName}
                    </span>
                    <span className="text-[10px] text-slateDark-500 font-mono">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    {isOwner && editingId !== c.id && (
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.comment);
                        }}
                        className="text-xs text-slateDark-400 hover:text-white"
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-xs text-red-500 hover:text-red-400"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {editingId === c.id ? (
                  <div className="space-y-2 pt-1 select-none">
                    <textarea
                      rows="2"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-lg text-white focus:outline-none text-xs"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 bg-slateDark-850 hover:bg-slateDark-800 text-slateDark-400 text-xs font-bold rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEditSubmit(c.id)}
                        className="px-3 py-1 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-slateDark-300 text-xs leading-relaxed whitespace-pre-line">
                    {c.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {comments.length === 0 && (
          <div className="text-center py-8 text-slateDark-500 text-xs font-semibold select-none">
            No comments posted yet.
          </div>
        )}
      </div>
    </div>
  );
}

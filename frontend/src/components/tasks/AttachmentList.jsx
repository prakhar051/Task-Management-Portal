import React, { useState } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { apiClient } from '../../api/apiClient';

export default function AttachmentList({ taskId }) {
  const attachments = useTaskStore((state) => state.attachments);
  const addAttachment = useTaskStore((state) => state.addAttachment);
  const deleteAttachment = useTaskStore((state) => state.deleteAttachment);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 10MB
    const limit = 10 * 1024 * 1024;
    if (file.size > limit) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      await addAttachment(taskId, file);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload attachment file.');
    } finally {
      setIsUploading(false);
      // Clear input
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attachment file?')) {
      try {
        await deleteAttachment(id);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete file.');
      }
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.includes('pdf')) return '📕';
    if (fileType.includes('zip') || fileType.includes('compressed')) return '🗄️';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    if (fileType.includes('excel') || fileType.includes('sheet')) return '📊';
    return '📎';
  };

  return (
    <div className="space-y-6 text-sm font-semibold">
      <div className="flex items-center justify-between border-b border-slateDark-900 pb-4 select-none">
        <div className="flex items-center space-x-2">
          <span className="text-lg">📎</span>
          <h3 className="font-bold text-white text-base">File Attachments</h3>
          <span className="px-2.5 py-0.5 bg-slateDark-900 border border-slateDark-800 text-slateDark-400 rounded-full text-xs font-mono font-bold">
            {attachments.length}
          </span>
        </div>

        {/* Upload Input */}
        <label className="relative flex items-center space-x-2 px-4 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer">
          <span>{isUploading ? '⏳ Uploading...' : '📤 Upload File'}</span>
          <input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
            className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </label>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      {/* Attachments List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attachments.map((file) => (
          <div
            key={file.id}
            className="p-4 bg-slateDark-900/40 border border-slateDark-900 rounded-xl flex items-center justify-between hover:border-slateDark-800/80 transition-colors animate-fade-in group"
          >
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className="text-2xl select-none">{getFileIcon(file.fileType)}</span>
              <div className="overflow-hidden">
                <a
                  href={`${apiClient.defaults.baseURL || ''}${file.filePath}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-white hover:text-brand-400 text-xs truncate block hover:underline"
                >
                  {file.fileName}
                </a>
                <span className="text-[10px] text-slateDark-500 font-mono block select-none">
                  Uploaded {new Date(file.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(file.id)}
              className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
            >
              🗑️
            </button>
          </div>
        ))}

        {attachments.length === 0 && (
          <div className="sm:col-span-2 text-center py-8 text-slateDark-500 text-xs font-semibold select-none">
            No files attached yet.
          </div>
        )}
      </div>
    </div>
  );
}

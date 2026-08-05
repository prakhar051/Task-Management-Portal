import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import VersionHistory from '../components/documents/VersionHistory';
import DocumentPreview from '../components/documents/DocumentPreview';

export default function DocumentDetails() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);

  const activeDocument = useDocumentStore((state) => state.activeDocument);
  const versions = useDocumentStore((state) => state.versions);
  const loading = useDocumentStore((state) => state.loading);
  const uploadProgress = useDocumentStore((state) => state.uploadProgress);
  const error = useDocumentStore((state) => state.error);

  const fetchVersions = useDocumentStore((state) => state.fetchVersions);
  const uploadVersion = useDocumentStore((state) => state.uploadVersion);
  const archive = useDocumentStore((state) => state.archive);
  const restore = useDocumentStore((state) => state.restore);
  const download = useDocumentStore((state) => state.download);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchVersions(id);
  }, [fetchVersions, id]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadVersionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    const success = await uploadVersion(id, selectedFile);
    if (success) {
      setSelectedFile(null);
    }
  };

  if (loading && !activeDocument) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-500 italic">
        Loading document version parameters...
      </div>
    );
  }

  if (!activeDocument) {
    return (
      <div className="py-24 text-center text-xs text-slateDark-600 italic">
        Document record could not be resolved. <Link to="/documents" className="text-brand-400 font-bold underline">Go back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <Link to="/documents" className="hover:text-white">Documents</Link>
            <span>/</span>
            <span className="text-white font-mono">{activeDocument.name}</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">{activeDocument.name}</h1>
        </div>

        <div className="flex items-center space-x-3 text-xs font-bold font-mono">
          <button
            onClick={() => setPreviewDoc(activeDocument)}
            className="px-4 py-2 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl transition-all"
          >
            👁️ Preview Latest
          </button>
          <button
            onClick={() => download(activeDocument.id)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all shadow-md shadow-brand-500/10"
          >
            📥 Download Latest
          </button>
          {activeDocument.status !== 'ARCHIVED' ? (
            <button
              onClick={async () => {
                await archive(activeDocument.id);
                fetchVersions(id);
              }}
              className="px-4 py-2 border border-slateDark-800 hover:border-amber-500/20 text-slateDark-400 hover:text-amber-400 rounded-xl transition-all"
            >
              📦 Archive File
            </button>
          ) : (
            <button
              onClick={async () => {
                await restore(activeDocument.id);
                fetchVersions(id);
              }}
              className="px-4 py-2 border border-slateDark-800 hover:border-emerald-500/20 text-slateDark-400 hover:text-emerald-400 rounded-xl transition-all"
            >
              🔄 Restore Active
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Meta Details */}
        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider border-b border-slateDark-900 pb-2">
            📌 Document Information
          </h3>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slateDark-500">Categorization:</span>
              <span className="text-white uppercase font-mono">{activeDocument.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Scope Type:</span>
              <span className="text-white uppercase font-mono">{activeDocument.entityType}</span>
            </div>
            {activeDocument.entityId && (
              <div className="flex justify-between">
                <span className="text-slateDark-500">Scope UUID:</span>
                <span className="text-white font-mono select-all truncate max-w-[120px]" title={activeDocument.entityId}>
                  {activeDocument.entityId}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slateDark-500">Current Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                activeDocument.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {activeDocument.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Uploaded By:</span>
              <span className="text-white">
                {activeDocument.uploadedBy?.firstName} {activeDocument.uploadedBy?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slateDark-500">Creation Date:</span>
              <span className="text-white font-mono">
                {new Date(activeDocument.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Revision Control */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload revision card */}
          {activeDocument.status !== 'ARCHIVED' && (
            <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
                ⚙️ Upload New Version Revision
              </h3>
              <form onSubmit={handleUploadVersionSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <input
                  type="file"
                  onChange={handleFileChange}
                  id="revision-upload"
                  className="hidden"
                />
                <label
                  htmlFor="revision-upload"
                  className="flex-1 px-4 py-2.5 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold text-center cursor-pointer truncate"
                >
                  {selectedFile ? selectedFile.name : 'Select file to replace this revision...'}
                </label>

                <button
                  type="submit"
                  disabled={!selectedFile || uploadProgress > 0}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-black disabled:opacity-50 transition-all"
                >
                  Upload Revision
                </button>
              </form>

              {uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="w-full bg-slateDark-900 rounded-full h-1 overflow-hidden">
                    <div className="bg-brand-500 h-1 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Revisions timeline */}
          <VersionHistory
            versions={versions}
            onDownload={download}
            documentId={activeDocument.id}
          />
        </div>
      </div>

      {/* Preview screen */}
      <DocumentPreview
        doc={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}

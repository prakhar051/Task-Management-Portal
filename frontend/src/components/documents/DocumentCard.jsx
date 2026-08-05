import React from 'react';
import { Link } from 'react-router-dom';

export default function DocumentCard({ doc, selected, onToggleSelect, onDownload, onPreview, onArchive, onDelete, user }) {
  const latestVer = doc.versions[0];
  const isChecked = selected.includes(doc.id);

  const getFileIcon = (category) => {
    switch (category) {
      case 'PDF':
        return '🟥 PDF';
      case 'IMAGE':
        return '🟩 IMG';
      case 'SPREADSHEET':
        return '🟩 XLS';
      case 'CONTRACT':
        return '🟪 DOC';
      case 'PROFILE':
        return '🟦 USR';
      default:
        return '⬜ BIN';
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4 shadow-md select-none relative hover:border-slateDark-800 transition-colors">
      <div className="flex justify-between items-start">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => onToggleSelect(doc.id)}
          className="h-3.5 w-3.5 rounded bg-slateDark-900 border-slateDark-850 cursor-pointer mt-1"
        />
        <span className="text-[10px] font-black font-mono text-slateDark-500 uppercase tracking-wider bg-slateDark-900 px-2 py-0.5 rounded-full border border-slateDark-850">
          {getFileIcon(doc.category)}
        </span>
      </div>

      <div className="space-y-1">
        <Link to={`/documents/${doc.id}`} className="hover:text-brand-400 block">
          <h4 className="text-sm font-extrabold text-white truncate">{doc.name}</h4>
        </Link>
        <p className="text-[10px] text-slateDark-500 font-semibold font-mono truncate">
          Scope: {doc.entityType} | {latestVer ? formatBytes(latestVer.fileSize) : '--'}
        </p>
      </div>

      <div className="flex justify-between items-center border-t border-slateDark-900/60 pt-3 text-[10px] text-slateDark-400 font-semibold">
        <span>v{latestVer ? latestVer.versionNumber : 1}</span>
        <div className="flex items-center space-x-2.5">
          <button onClick={() => onPreview(doc)} className="hover:text-white" title="Preview">👁️</button>
          <button onClick={() => onDownload(doc.id)} className="hover:text-white" title="Download">📥</button>
          {doc.status !== 'ARCHIVED' && (
            <button onClick={() => onArchive(doc.id)} className="hover:text-amber-400" title="Archive">📦</button>
          )}
          {user?.role === 'ADMIN' && (
            <button onClick={() => onDelete(doc.id)} className="hover:text-red-400" title="Delete">🗑️</button>
          )}
        </div>
      </div>
    </div>
  );
}

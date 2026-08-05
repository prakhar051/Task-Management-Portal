import React from 'react';
import { Link } from 'react-router-dom';

export default function DocumentTable({
  documents,
  selected,
  onToggleSelect,
  onToggleAll,
  onDownload,
  onPreview,
  onArchive,
  onDelete,
  user
}) {
  const getCategoryColor = (category) => {
    switch (category) {
      case 'PDF':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'IMAGE':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'SPREADSHEET':
        return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'CONTRACT':
        return 'bg-purple-500/10 border-purple-500/20 text-purple-400';
      case 'PROFILE':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
      default:
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'ARCHIVED':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'DELETED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      default:
        return 'bg-slateDark-900 text-slateDark-400';
    }
  };

  const allSelected = documents.length > 0 && selected.length === documents.length;

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg select-none">
      <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slateDark-950/90 backdrop-blur-md border-b border-slateDark-900 z-10">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-5 w-12 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  className="h-3.5 w-3.5 rounded bg-slateDark-900 border-slateDark-850 cursor-pointer"
                />
              </th>
              <th className="py-4 px-5">Name</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Scope</th>
              <th className="py-4 px-5">Revision</th>
              <th className="py-4 px-5">Uploaded By</th>
              <th className="py-4 px-5">Upload Date</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {documents.map((doc) => {
              const latestVer = doc.versions[0];
              const isItemChecked = selected.includes(doc.id);

              return (
                <tr key={doc.id} className="hover:bg-slateDark-900/10 transition-colors">
                  <td className="py-3.5 px-5 text-center">
                    <input
                      type="checkbox"
                      checked={isItemChecked}
                      onChange={() => onToggleSelect(doc.id)}
                      className="h-3.5 w-3.5 rounded bg-slateDark-900 border-slateDark-850 cursor-pointer"
                    />
                  </td>
                  <td className="py-3.5 px-5 font-bold text-white max-w-[200px] truncate">
                    <Link to={`/documents/${doc.id}`} className="hover:text-brand-400 flex items-center space-x-2">
                      <span>📄</span>
                      <span className="truncate">{doc.name}</span>
                    </Link>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getCategoryColor(doc.category)}`}>
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slateDark-400 font-mono">
                    {doc.entityType}
                  </td>
                  <td className="py-3.5 px-5 font-mono text-white">
                    v{latestVer ? latestVer.versionNumber : 1}
                  </td>
                  <td className="py-3.5 px-5 text-slateDark-300">
                    {doc.uploadedBy?.firstName} {doc.uploadedBy?.lastName}
                  </td>
                  <td className="py-3.5 px-5 text-slateDark-400 font-mono">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(doc.status)}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-2.5">
                    <button
                      onClick={() => onPreview(doc)}
                      className="text-[10px] text-slateDark-400 hover:text-white"
                      title="Preview Document"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => onDownload(doc.id)}
                      className="text-[10px] text-slateDark-400 hover:text-white"
                      title="Download"
                    >
                      📥
                    </button>
                    {doc.status !== 'ARCHIVED' && (
                      <button
                        onClick={() => onArchive(doc.id)}
                        className="text-[10px] text-slateDark-400 hover:text-amber-400"
                        title="Archive"
                      >
                        📦
                      </button>
                    )}
                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => onDelete(doc.id)}
                        className="text-[10px] text-slateDark-400 hover:text-red-400"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {documents.length === 0 && (
              <tr>
                <td colSpan={9} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No active documents matched the lookup filter query
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

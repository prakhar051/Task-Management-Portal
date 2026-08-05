import React from 'react';

export default function VersionHistory({ versions, onDownload, documentId }) {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 select-none">
      <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
        📜 Revision Version Timeline ({versions.length})
      </h3>

      <div className="relative border-l border-slateDark-900 ml-4 space-y-6">
        {versions.map((ver, idx) => (
          <div key={ver.id} className="relative pl-6">
            {/* Marker Circle */}
            <span className={`absolute -left-2.5 top-1.5 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black border font-mono ${
              idx === 0
                ? 'bg-brand-500 border-brand-500 text-white'
                : 'bg-slateDark-950 border-slateDark-800 text-slateDark-400'
            }`}>
              {ver.versionNumber}
            </span>

            <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white truncate max-w-[250px]">
                    {ver.originalFilename}
                  </span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black bg-brand-500/10 border border-brand-500/30 text-brand-400 uppercase tracking-wide">
                      LATEST
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slateDark-500 font-semibold font-mono">
                  Uploaded by: {ver.uploadedBy?.firstName} {ver.uploadedBy?.lastName} | Size: {formatBytes(ver.fileSize)} | {new Date(ver.createdAt).toLocaleString()}
                </p>
                <p className="text-[8.5px] text-slateDark-600 font-mono select-all truncate max-w-[320px]">
                  Checksum: {ver.checksum || 'N/A'}
                </p>
              </div>

              <button
                onClick={() => onDownload(documentId, ver.versionNumber)}
                className="px-3.5 py-1.5 bg-slateDark-905 hover:bg-slateDark-850 border border-slateDark-800 text-slateDark-300 hover:text-white rounded-xl text-[10px] font-black transition-all flex items-center space-x-1.5"
              >
                <span>📥 Download v{ver.versionNumber}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

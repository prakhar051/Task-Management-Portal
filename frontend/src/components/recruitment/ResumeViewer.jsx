import React from 'react';

export default function ResumeViewer({ candidate }) {
  const resumeDoc = candidate?.documents?.find((d) => d.type === 'RESUME');
  if (!resumeDoc) {
    return (
      <div className="bg-slateDark-950/40 border border-dashed border-slateDark-900 p-8 rounded-3xl text-center text-xs text-slateDark-500 font-semibold italic">
        📄 No resume uploaded for this candidate yet.
      </div>
    );
  }

  // Bind inline preview path
  const pdfUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents/${resumeDoc.documentId}/preview`;

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl p-5 space-y-4 shadow-md select-none">
      <div className="flex justify-between items-center border-b border-slateDark-900 pb-2">
        <h4 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
          📄 Resume Document Previewer
        </h4>
      </div>

      <div className="h-[450px] bg-slateDark-905 rounded-2xl overflow-hidden border border-slateDark-900/60">
        <iframe
          src={pdfUrl}
          title={`${candidate.firstName} Resume`}
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
}

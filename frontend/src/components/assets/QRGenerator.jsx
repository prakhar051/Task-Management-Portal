import React from 'react';
import { QrCode, Download } from 'lucide-react';

const QRGenerator = ({ tag }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(tag)}`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Inventory QR Code</span>
      <div className="p-3 bg-white rounded-xl shadow-lg border border-zinc-200">
        <img
          src={qrUrl}
          alt={`QR Code for ${tag}`}
          className="w-32 h-32 select-none"
          loading="lazy"
        />
      </div>
      <span className="mt-3 text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
        {tag}
      </span>
      <a
        href={qrUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={`QR_${tag}.png`}
        className="mt-4 flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Open QR PNG</span>
      </a>
    </div>
  );
};

export default QRGenerator;

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDialog({ isOpen, onClose, onUpload, uploadProgress }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragOver(true);
    } else if (e.type === 'dragleave') {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const onSubmitForm = async (data) => {
    if (!selectedFile) return;
    const success = await onUpload(selectedFile, {
      name: data.name || selectedFile.name,
      category: data.category,
      entityType: data.entityType,
      entityId: data.entityId || null
    });
    if (success) {
      setSelectedFile(null);
      reset();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slateDark-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slateDark-950 border border-slateDark-900 rounded-3xl p-6 space-y-4 shadow-2xl relative"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-slateDark-500 hover:text-white">✕</button>

          <div className="border-b border-slateDark-900 pb-3">
            <h3 className="text-base font-extrabold text-white">Upload Document</h3>
            <p className="text-slateDark-500 text-xs mt-0.5">Upload a new document to secure local directory storage.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            {/* Drag & Drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragOver ? 'border-brand-500 bg-brand-500/5' : 'border-slateDark-800 hover:border-slateDark-700'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <span className="text-3xl block">📤</span>
                <span className="text-xs font-bold text-white block">
                  {selectedFile ? selectedFile.name : 'Drag & drop your file here, or browse'}
                </span>
                <span className="text-[10px] text-slateDark-500 block">
                  Supports PDF, PNG, JPG, DOCX, XLSX, ZIP (Max 20MB)
                </span>
              </label>
            </div>

            {/* Custom file name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Document Name</label>
              <input
                type="text"
                placeholder="Optional custom display title"
                {...register('name')}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs focus:outline-none"
              />
            </div>

            {/* Category selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Category</label>
                <select
                  {...register('category', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="OTHER">Other</option>
                  <option value="PDF">PDF File</option>
                  <option value="IMAGE">Image</option>
                  <option value="PROFILE">Profile Document</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="REPORT">Report Sheet</option>
                  <option value="SPREADSHEET">Spreadsheet</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Scope Reference</label>
                <select
                  {...register('entityType', { required: true })}
                  className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="GENERAL">General</option>
                  <option value="EMPLOYEE">Employee</option>
                  <option value="PROJECT">Project</option>
                  <option value="TASK">Task</option>
                  <option value="DEPARTMENT">Department</option>
                  <option value="LEAVE">Leave Request</option>
                  <option value="ATTENDANCE">Attendance record</option>
                </select>
              </div>
            </div>

            {/* Reference ID (Optional) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slateDark-400 uppercase tracking-wider block">Reference Entity UUID</label>
              <input
                type="text"
                placeholder="Optional matching entity ID"
                {...register('entityId')}
                className="w-full px-3.5 py-2.5 bg-slateDark-905 border border-slateDark-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            {/* Progress indicators */}
            {uploadProgress > 0 && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-slateDark-400">
                  <span>Uploading file progress</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slateDark-900 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-500 h-1.5 transition-all" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slateDark-905 border border-slateDark-800 hover:border-slateDark-750 text-slateDark-400 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedFile || uploadProgress > 0}
                className="px-5 py-2 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                Upload File
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

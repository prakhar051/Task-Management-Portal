import React, { useEffect, useState } from 'react';
import { useDocumentStore } from '../store/documentStore';
import { useAuthStore } from '../store/authStore';
import DocumentToolbar from '../components/documents/DocumentToolbar';
import FilterPanel from '../components/documents/FilterPanel';
import DocumentTable from '../components/documents/DocumentTable';
import DocumentCard from '../components/documents/DocumentCard';
import BulkActions from '../components/documents/BulkActions';
import UploadDialog from '../components/documents/UploadDialog';
import DocumentPreview from '../components/documents/DocumentPreview';

export default function Documents() {
  const user = useAuthStore((state) => state.user);

  const documents = useDocumentStore((state) => state.documents);
  const selected = useDocumentStore((state) => state.selected);
  const filters = useDocumentStore((state) => state.filters);
  const pagination = useDocumentStore((state) => state.pagination);
  const loading = useDocumentStore((state) => state.loading);
  const uploadProgress = useDocumentStore((state) => state.uploadProgress);
  const error = useDocumentStore((state) => state.error);

  const fetchDocuments = useDocumentStore((state) => state.fetchDocuments);
  const upload = useDocumentStore((state) => state.upload);
  const archive = useDocumentStore((state) => state.archive);
  const remove = useDocumentStore((state) => state.delete);
  const download = useDocumentStore((state) => state.download);
  const bulkDownload = useDocumentStore((state) => state.bulkDownload);
  const setFilters = useDocumentStore((state) => state.setFilters);
  const resetFilters = useDocumentStore((state) => state.resetFilters);
  const setSelected = useDocumentStore((state) => state.setSelected);

  const [viewMode, onViewModeChange] = useState('table');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, filters]);

  const handleToggleSelect = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleToggleAll = () => {
    if (selected.length === documents.length) {
      setSelected([]);
    } else {
      setSelected(documents.map((d) => d.id));
    }
  };

  const handlePageChange = (page) => {
    fetchDocuments({ page });
  };

  const handleSearch = (searchVal) => {
    setFilters({ search: searchVal });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleUpload = async (file, meta) => {
    return upload(file, meta);
  };

  const handleBulkDownload = () => {
    bulkDownload(selected);
    setSelected([]);
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Documents</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Documents & Local Storage</h1>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Document filter widgets */}
      <FilterPanel
        activeFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

      {/* Main search and action toolbar */}
      <DocumentToolbar
        searchVal={filters.search}
        onSearchChange={handleSearch}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        onUploadClick={() => setIsUploadOpen(true)}
        pagination={pagination}
        onPageChange={handlePageChange}
      />

      {loading ? (
        <div className="py-24 text-center text-xs text-slateDark-500 italic">
          Loading document inventory directories...
        </div>
      ) : viewMode === 'table' ? (
        <DocumentTable
          documents={documents}
          selected={selected}
          onToggleSelect={handleToggleSelect}
          onToggleAll={handleToggleAll}
          onDownload={download}
          onPreview={setPreviewDoc}
          onArchive={archive}
          onDelete={remove}
          user={user}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              selected={selected}
              onToggleSelect={handleToggleSelect}
              onDownload={download}
              onPreview={setPreviewDoc}
              onArchive={archive}
              onDelete={remove}
              user={user}
            />
          ))}

          {documents.length === 0 && (
            <div className="col-span-full py-24 text-center text-xs text-slateDark-600 italic border border-slateDark-900/60 rounded-3xl">
              No active documents matched the lookup filter query
            </div>
          )}
        </div>
      )}

      {/* Floating bulk actions toolbar */}
      <BulkActions
        selectedCount={selected.length}
        onBulkDownload={handleBulkDownload}
        onClear={() => setSelected([])}
      />

      {/* File upload prompt */}
      <UploadDialog
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
      />

      {/* Inline preview screen */}
      <DocumentPreview
        doc={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
      />
    </div>
  );
}

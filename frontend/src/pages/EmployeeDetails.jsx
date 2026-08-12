import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEmployeeStore } from '../store/employeeStore';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorState from '../components/dashboard/ErrorState';
import { API_URL } from '../api/apiClient';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user) || { role: 'EMPLOYEE' };
  const { currentEmployee, fetchEmployeeById, uploadAvatar, loading, error } = useEmployeeStore();

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    fetchEmployeeById(id);
  }, [id, fetchEmployeeById]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    const result = await uploadAvatar(id, file);
    setUploading(false);

    if (!result.success) {
      setUploadError(result.error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getAvatarPath = (path) => {
    if (!path) return null;
    const baseUrl = API_URL.replace(/\/api(\/v1)?\/?$/, '');
    return `${baseUrl}${path}`;
  };

  if (loading && !currentEmployee) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Link to="/employees" className="text-sm text-slateDark-400 hover:text-white transition-colors">
          ← Back to Team
        </Link>
        <ErrorState errorMsg={error} onRetry={() => fetchEmployeeById(id)} />
      </div>
    );
  }

  if (!currentEmployee) {
    return null;
  }

  // RBAC Client Guard Check:
  // Regular employees cannot inspect other employee profiles
  const isOwner = currentEmployee.userId === currentUser.id;
  const isAuthorized = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER' || isOwner;

  if (!isAuthorized) {
    return (
      <div className="space-y-6">
        <Link to="/dashboard" className="text-sm text-slateDark-400 hover:text-white transition-colors">
          ← Back to Dashboard
        </Link>
        <ErrorState errorMsg="Access Denied: You are only authorized to inspect your own employee profile details." />
      </div>
    );
  }

  const fullName = `${currentEmployee.firstName} ${currentEmployee.lastName}`;

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Navigation link */}
      {currentUser.role !== 'EMPLOYEE' && (
        <Link
          to="/employees"
          className="inline-flex items-center space-x-2 text-sm text-slateDark-400 hover:text-white transition-colors select-none"
        >
          <span>←</span>
          <span>Back to Team Registry</span>
        </Link>
      )}

      {/* Main card */}
      <div className="glass rounded-2xl border border-slateDark-800 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl" />
        
        {/* Left avatar column */}
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border border-slateDark-800 bg-slateDark-900 flex items-center justify-center relative group">
            {currentEmployee.avatar ? (
              <img
                src={getAvatarPath(currentEmployee.avatar)}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-4xl font-extrabold text-brand-400 uppercase select-none">
                {currentEmployee.firstName.charAt(0)}
                {currentEmployee.lastName.charAt(0)}
              </span>
            )}

            {/* Hover overlay triggers avatar uploader (Only if Admin or Profile Owner) */}
            {(currentUser.role === 'ADMIN' || isOwner) && (
              <div
                onClick={triggerFileInput}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200"
              >
                <span className="text-lg">📷</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider mt-1">Upload Photo</span>
              </div>
            )}

            {uploading && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />

          {uploadError && (
            <p className="text-red-500 text-[10px] mt-2 text-center max-w-[150px] font-semibold">{uploadError}</p>
          )}

          <div className="mt-4 text-center">
            <span className="text-xs font-mono font-bold text-slateDark-400 select-all">{currentEmployee.employeeCode}</span>
          </div>
        </div>

        {/* Right details column */}
        <div className="flex-1 space-y-6 w-full">
          <div>
            <h2 className="text-3xl font-extrabold text-white leading-tight">{fullName}</h2>
            <p className="text-brand-400 font-semibold mt-1.5 flex items-center gap-2 text-sm">
              <span>{currentEmployee.designation}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slateDark-700" />
              <span className="text-slateDark-400 uppercase text-xs font-mono tracking-wider">{currentEmployee.status}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 border-t border-slateDark-900 pt-6">
            <div>
              <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider select-none">Email Address</span>
              <a href={`mailto:${currentEmployee.email}`} className="text-white hover:underline text-sm font-semibold mt-1 block">
                {currentEmployee.email}
              </a>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider select-none">Phone Number</span>
              <span className="text-slateDark-200 text-sm font-semibold mt-1 block">{currentEmployee.phone}</span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider select-none">Hire Date</span>
              <span className="text-slateDark-200 text-sm font-semibold mt-1 block font-mono">
                {currentEmployee.hireDate ? new Date(currentEmployee.hireDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slateDark-500 uppercase tracking-wider select-none">Report Manager</span>
              <span className="text-slateDark-300 text-sm font-semibold mt-1 block">
                {currentEmployee.managerId ? 'Assigned Manager' : 'Unassigned'}
              </span>
            </div>
          </div>

          {/* future module integration alerts info banner */}
          <div className="p-4 rounded-xl bg-slateDark-900/40 border border-slateDark-900 text-xs text-slateDark-400">
            💡 <span className="font-bold text-slateDark-300">Relational Integrations:</span> Department allocations, assigned active project workloads, tasks completions ratios, and payroll metadata will be mapped here as those business modules are implemented.
          </div>
        </div>
      </div>
    </div>
  );
}

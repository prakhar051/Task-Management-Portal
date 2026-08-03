import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user, updateProfile, changePassword, loading } = useAuthStore();
  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: profileErrors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPasswordForm, formState: { errors: passwordErrors } } = useForm();

  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onProfileSubmit = async (data) => {
    setProfileSuccess(null);
    setProfileError(null);
    const result = await updateProfile({ name: data.name, email: data.email });
    if (result.success) {
      setProfileSuccess('Profile updated successfully.');
    } else {
      setProfileError(result.error);
    }
  };

  const onPasswordSubmit = async (data) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    const result = await changePassword(data.oldPassword, data.newPassword);
    if (result.success) {
      setPasswordSuccess('Password changed successfully.');
      resetPasswordForm();
    } else {
      setPasswordError(result.error);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Account Settings</h1>
        <p className="text-slateDark-400 mt-2">Manage your public credentials and workspace security profile.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile edit card */}
        <div className="glass rounded-xl p-6 h-fit">
          <h3 className="font-bold text-lg text-white mb-6">Profile Information</h3>

          {profileSuccess && (
            <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {profileSuccess}
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {profileError}
            </div>
          )}

          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slateDark-300 mb-1">Full Name</label>
              <input
                type="text"
                {...registerProfile('name', { required: 'Name is required' })}
                className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
              {profileErrors.name && <p className="text-red-500 text-xs mt-1">{profileErrors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slateDark-300 mb-1">Email Address</label>
              <input
                type="email"
                {...registerProfile('email', { required: 'Email address is required' })}
                className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
              />
              {profileErrors.email && <p className="text-red-500 text-xs mt-1">{profileErrors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slateDark-400 mb-1">Security Role</label>
              <input
                type="text"
                disabled
                value={user?.role || 'MEMBER'}
                className="w-full px-4 py-2.5 rounded-lg bg-slateDark-950 border border-slateDark-900 text-slateDark-500 font-mono text-xs uppercase select-none cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change password card */}
        <div className="glass rounded-xl p-6 h-fit">
          <h3 className="font-bold text-lg text-white mb-6">Security Credentials</h3>

          {passwordSuccess && (
            <div className="mb-4 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {passwordSuccess}
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {passwordError}
            </div>
          )}

          <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slateDark-300 mb-1">Current Password</label>
              <input
                type="password"
                {...registerPassword('oldPassword', { required: 'Current password is required' })}
                className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                placeholder="••••••••"
              />
              {passwordErrors.oldPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.oldPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slateDark-300 mb-1">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'New password is required',
                  pattern: {
                    value: passwordRegex,
                    message: 'Must contain min 8 chars, uppercase, lowercase, number, symbol'
                  }
                })}
                className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
                placeholder="••••••••"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all text-sm disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

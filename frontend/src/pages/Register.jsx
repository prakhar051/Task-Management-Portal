import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/layout/AuthLayout';

export default function Register() {
  const navigate = useNavigate();
  const registerAction = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const onSubmit = async (data) => {
    setServerError(null);
    setSuccessMsg(null);
    const result = await registerAction(data.name, data.email, data.password, data.role);
    if (result.success) {
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setServerError(result.error);
    }
  };

  return (
    <AuthLayout>
      <div className="glass-card rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 text-brand-400 flex items-center justify-center rounded-2xl mx-auto mb-4 border border-brand-500/30">
            <span className="text-2xl font-bold">🎯</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Account</h2>
          <p className="text-slateDark-400 mt-2 text-sm">Join the collaborative portal workspace</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-1">Full Name</label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className={`w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border ${errors.name ? 'border-red-500' : 'border-slateDark-800'} text-white focus:outline-none focus:border-brand-500 transition-colors text-sm`}
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-1">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email address is required' })}
              className={`w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border ${errors.email ? 'border-red-500' : 'border-slateDark-800'} text-white focus:outline-none focus:border-brand-500 transition-colors text-sm`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-1">Role Allocation</label>
            <select
              {...register('role', { required: 'Role is required' })}
              className="w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border border-slateDark-800 text-white focus:outline-none focus:border-brand-500 transition-colors text-sm"
            >
              <option value="EMPLOYEE">Employee</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-1">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                pattern: {
                  value: passwordRegex,
                  message: 'Must contain min 8 chars, uppercase, lowercase, number, symbol'
                }
              })}
              className={`w-full px-4 py-2.5 rounded-lg bg-slateDark-900 border ${errors.password ? 'border-red-500' : 'border-slateDark-800'} text-white focus:outline-none focus:border-brand-500 transition-colors text-sm`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="text-xs text-slateDark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign In
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

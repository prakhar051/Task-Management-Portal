import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/layout/AuthLayout';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState(null);

  const onSubmit = async (data) => {
    setServerError(null);
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/dashboard');
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
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-slateDark-400 mt-2 text-sm">Access your task dashboard portal</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-2">Email Address</label>
            <input
              type="email"
              {...register('email', { required: 'Email address is required' })}
              className={`w-full px-4 py-3 rounded-lg bg-slateDark-900 border ${errors.email ? 'border-red-500' : 'border-slateDark-800'} text-white focus:outline-none focus:border-brand-500 transition-colors`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slateDark-300 mb-2">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className={`w-full px-4 py-3 rounded-lg bg-slateDark-900 border ${errors.password ? 'border-red-500' : 'border-slateDark-800'} text-white focus:outline-none focus:border-brand-500 transition-colors`}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="text-slateDark-400 text-xs">
              Need an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Sign Up
              </Link>
            </div>
            <a href="#forgot" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

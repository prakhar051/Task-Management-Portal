import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Login submitted:', data);
    // Simulate login success and redirect to Dashboard
    localStorage.setItem('user_session', JSON.stringify({ name: 'Demo User', role: 'ADMIN' }));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slateDark-950 px-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-card rounded-2xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-brand-500/20 text-brand-400 flex items-center justify-center rounded-2xl mx-auto mb-4 border border-brand-500/30">
            <span className="text-2xl font-bold">🎯</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-slateDark-400 mt-2 text-sm">Access your task dashboard portal</p>
        </div>

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
            <label className="flex items-center space-x-2 text-slateDark-400 hover:text-slateDark-300 cursor-pointer">
              <input type="checkbox" className="rounded bg-slateDark-900 border-slateDark-800 text-brand-500 focus:ring-0 focus:ring-offset-0" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold transition-all shadow-lg shadow-brand-600/20 active:scale-95"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

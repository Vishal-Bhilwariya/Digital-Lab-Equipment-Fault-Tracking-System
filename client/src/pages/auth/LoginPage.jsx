import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Wrench, Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleDemoLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(email, password);
      if (userData.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/assistant');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-blue-600 mx-auto flex items-center justify-center text-white mb-3 shadow-md shadow-blue-500/20">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Staff Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized access for University Lab Administrators & Assistants
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg text-sm transition shadow-md shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-3">
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@univ.edu', 'Admin@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Fill Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('assistant.chem@univ.edu', 'Assistant@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-700/60 border border-slate-700 rounded-lg text-xs font-medium text-slate-200 transition"
              >
                <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                Fill Assistant
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

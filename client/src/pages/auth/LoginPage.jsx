import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Wrench, Lock, Mail, AlertCircle, ArrowLeft, FlaskConical } from 'lucide-react';

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
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || '';

      if (status === 503 || serverMsg.toLowerCase().includes('database not connected')) {
        setError(
          '⚠️ Database is not reachable. The server admin must whitelist the server IP in MongoDB Atlas → Security → Network Access.'
        );
      } else if (status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } else {
        setError(serverMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-[#080F20] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-[#0c152e]/85 border border-white/[0.08] rounded-2xl p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white mb-3 shadow-lg shadow-cyan-500/25">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Staff Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized access for University Lab Administrators & Assistants
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#060a14]/90 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#060a14]/90 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg shadow-cyan-500/25 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-white/[0.08]">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-3">
              Quick One-Click Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@univ.edu', 'Admin@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#080F20] hover:bg-[#111c38] border border-white/[0.08] hover:border-blue-500/40 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Fill Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('assistant.chem@univ.edu', 'Assistant@123')}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#080F20] hover:bg-[#111c38] border border-white/[0.08] hover:border-emerald-500/40 rounded-xl text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
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

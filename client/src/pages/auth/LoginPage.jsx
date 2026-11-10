import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  ShieldCheck,
  Wrench,
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  FlaskConical,
  GraduationCap,
  KeyRound,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role');

  // Active Login Mode: 'staff' (Admin/Assistant) or 'student'
  const [activeTab, setActiveTab] = useState(initialRole === 'Student' ? 'student' : 'staff');

  // Form states
  const [identifier, setIdentifier] = useState(''); // Email for staff, Roll Number for student
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Forced Password Change Modal (for first login with temp password)
  const [showFirstChangeModal, setShowFirstChangeModal] = useState(false);
  const [currentTempPass, setCurrentTempPass] = useState('');
  const [newFirstPass, setNewFirstPass] = useState('');
  const [confirmFirstPass, setConfirmFirstPass] = useState('');
  const [firstChangeLoading, setFirstChangeLoading] = useState(false);
  const [firstChangeError, setFirstChangeError] = useState('');
  const [loggedUserPending, setLoggedUserPending] = useState(null);

  // ── Forgot Password Modal States ──────────────────────────────────────────
  const [showForgotModal, setShowForgotModal] = useState(false);
  // Forgot steps: 1 = Enter Email, 2 = Enter 6-digit OTP, 3 = Set New Password, 4 = Success
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newForgotPass, setNewForgotPass] = useState('');
  const [confirmForgotPass, setConfirmForgotPass] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, updateUser } = useAuth();
  const navigate = useNavigate();

  // Handle countdown for resend OTP cooldown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDemoLogin = (demoIdentifier, demoPass, isStudentTab = false) => {
    setActiveTab(isStudentTab ? 'student' : 'staff');
    setIdentifier(demoIdentifier);
    setPassword(demoPass);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const isStudent = activeTab === 'student';
      const userData = await login(identifier, password, isStudent);

      // Check if user is forced to change password on first login
      if (userData.mustChangePassword) {
        setLoggedUserPending(userData);
        setCurrentTempPass(password);
        setShowFirstChangeModal(true);
        setLoading(false);
        return;
      }

      // Role-based routing
      if (userData.role === 'Admin') {
        navigate('/admin');
      } else if (userData.role === 'Assistant') {
        navigate('/assistant');
      } else {
        navigate('/student');
      }
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message || '';

      if (status === 503 || serverMsg.toLowerCase().includes('database not connected')) {
        setError(
          '⚠️ Database is not reachable. The server admin must whitelist the server IP in MongoDB Atlas.'
        );
      } else if (status === 401) {
        setError(
          activeTab === 'student'
            ? 'Invalid Student Roll Number or password. Please verify and try again.'
            : 'Invalid email address or password. Please verify and try again.'
        );
      } else if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5000.');
      } else {
        setError(serverMsg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── First Login Force Password Change ─────────────────────────────────────
  const handleFirstChangeSubmit = async (e) => {
    e.preventDefault();
    setFirstChangeError('');

    if (newFirstPass.length < 6) {
      setFirstChangeError('New password must be at least 6 characters.');
      return;
    }
    if (newFirstPass !== confirmFirstPass) {
      setFirstChangeError('New passwords do not match.');
      return;
    }

    setFirstChangeLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: currentTempPass,
        newPassword: newFirstPass
      });

      if (loggedUserPending) {
        updateUser({ mustChangePassword: false });
        setShowFirstChangeModal(false);

        if (loggedUserPending.role === 'Admin') {
          navigate('/admin');
        } else if (loggedUserPending.role === 'Assistant') {
          navigate('/assistant');
        } else {
          navigate('/student');
        }
      }
    } catch (err) {
      setFirstChangeError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setFirstChangeLoading(false);
    }
  };

  // ── Forgot Password Step 1: Request 6-digit OTP ───────────────────────────
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setForgotLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotSuccess(res.data.message || 'OTP dispatched to your registered email.');
      setResendCooldown(60); // 60s cooldown
      setForgotStep(2);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to send OTP code');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password Step 2: Verify OTP ────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);

    try {
      const res = await api.post('/auth/verify-otp', {
        email: forgotEmail,
        otp: otp.trim()
      });
      setResetToken(res.data.resetToken);
      setForgotSuccess('OTP verified successfully! Now choose your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Invalid or expired OTP code');
    } finally {
      setForgotLoading(false);
    }
  };

  // ── Forgot Password Step 3: Set New Password ──────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newForgotPass.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    if (newForgotPass !== confirmForgotPass) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail,
        resetToken,
        newPassword: newForgotPass
      });
      setForgotSuccess(res.data.message || 'Password reset successfully!');
      setForgotStep(4);
    } catch (err) {
      setForgotError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080F20] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
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

        <div className="bg-[#0c152e]/90 border border-white/[0.08] rounded-3xl p-7 sm:p-8 backdrop-blur-xl shadow-2xl shadow-black/60">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 mx-auto flex items-center justify-center text-white mb-3 shadow-lg shadow-cyan-500/25">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">System Sign In</h2>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to access your personalized laboratory portal
            </p>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#060b17] border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setError('');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Staff Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError('');
                setIdentifier('');
                setPassword('');
              }}
              className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student Login
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {activeTab === 'student' ? 'Student Roll Number' : 'Email Address or Assistant ID'}
              </label>
              <div className="relative">
                {activeTab === 'student' ? (
                  <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                )}
                <input
                  type="text"
                  required
                  placeholder={activeTab === 'student' ? 'e.g. 2200290100018' : 'e.g. admin@labtrack.edu'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#060a14]/90 border border-white/[0.1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(true);
                    setForgotStep(1);
                    setForgotError('');
                    setForgotSuccess('');
                    setOtp('');
                  }}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#060a14]/90 border border-white/[0.1] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-indigo-500/25'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/25'
              }`}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Authenticating...' : activeTab === 'student' ? 'Sign In as Student' : 'Sign In as Staff'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-7 pt-5 border-t border-white/[0.08]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block text-center mb-3">
              One-Click Demo Access
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@labtrack.edu', 'Admin@123', false)}
                className="flex flex-col items-center justify-center p-2 bg-[#080F20] hover:bg-[#111c38] border border-white/[0.08] rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 mb-0.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('rahul.sharma@labtrack.edu', 'Assistant@123', false)}
                className="flex flex-col items-center justify-center p-2 bg-[#080F20] hover:bg-[#111c38] border border-white/[0.08] rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-emerald-400 mb-0.5" />
                Assistant
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('2200290100018', 'Student@123', true)}
                className="flex flex-col items-center justify-center p-2 bg-[#080F20] hover:bg-[#111c38] border border-white/[0.08] rounded-xl text-[11px] font-medium text-slate-300 hover:text-white transition cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5 text-violet-400 mb-0.5" />
                Student
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FORGOT PASSWORD MODAL (All 3 Roles) ─────────────────────────────── */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Reset Password</h3>
                <p className="text-xs text-slate-400">
                  {forgotStep === 1 && 'Step 1 of 3: Enter registered email'}
                  {forgotStep === 2 && 'Step 2 of 3: Enter 6-digit OTP code'}
                  {forgotStep === 3 && 'Step 3 of 3: Set your new password'}
                  {forgotStep === 4 && 'Complete: Password updated'}
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* STEP 1: Enter Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter your registered email address (Administrator, Assistant, or Student). We will send a secure 6-digit verification code.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. name@university.edu"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {forgotLoading ? 'Sending...' : 'Send 6-Digit OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: Enter 6-digit OTP */}
            {forgotStep === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 text-xs text-slate-300">
                  <p>
                    A 6-digit OTP has been sent to <strong>{forgotEmail}</strong>.
                  </p>
                  <p className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5" />
                    Valid for 5 minutes only.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    6-Digit Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-center text-xl font-mono tracking-widest text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-slate-400 hover:text-white underline"
                  >
                    Change Email
                  </button>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || forgotLoading}
                    onClick={handleRequestOtp}
                    className="text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || otp.length !== 6}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Set New Password */}
            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-300 leading-relaxed">
                  Choose a new strong password with at least 6 characters, containing letters and numbers.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newForgotPass}
                    onChange={(e) => setNewForgotPass(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmForgotPass}
                    onChange={(e) => setConfirmForgotPass(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-teal-500/20 transition disabled:opacity-50"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {forgotLoading ? 'Updating...' : 'Set New Password'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 4: Success Confirmation */}
            {forgotStep === 4 && (
              <div className="space-y-5 text-center py-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">Password Updated Successfully!</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your password has been changed securely. You can now sign in with your new credentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FIRST LOGIN FORCE PASSWORD CHANGE MODAL ───────────────────────── */}
      {showFirstChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-amber-400/30 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/25 text-amber-400 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Set Personal Password</h3>
                <p className="text-xs text-amber-300">Required on first login with temporary credentials</p>
              </div>
            </div>

            {firstChangeError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{firstChangeError}</span>
              </div>
            )}

            <form onSubmit={handleFirstChangeSubmit} className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                For security compliance, please replace your temporary credentials with a permanent personal password.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newFirstPass}
                  onChange={(e) => setNewFirstPass(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmFirstPass}
                  onChange={(e) => setConfirmFirstPass(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={firstChangeLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg transition disabled:opacity-50"
                >
                  {firstChangeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {firstChangeLoading ? 'Saving...' : 'Set Password & Enter Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

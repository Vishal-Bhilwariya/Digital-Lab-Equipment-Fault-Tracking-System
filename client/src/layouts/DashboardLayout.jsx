import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileSpreadsheet,
  Cpu,
  CalendarCheck2,
  AlertOctagon,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Wrench,
  FlaskConical,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'Admin';
  const assignedLab = user?.assignedLab;

  const adminNav = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/labs', label: 'Laboratories', icon: Building2 },
    { to: '/admin/assistants', label: 'Lab Assistants', icon: Users },
    { to: '/admin/reports', label: 'Audit Reports', icon: FileSpreadsheet },
  ];

  const assistantNav = [
    { to: '/assistant', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/assistant/equipment', label: 'Equipment Inventory', icon: Cpu },
    { to: '/assistant/calibrations', label: 'Calibration Schedule', icon: CalendarCheck2 },
    { to: '/assistant/tickets', label: 'Damaged Queue', icon: AlertOctagon },
  ];

  const navLinks = isAdmin ? adminNav : assistantNav;

  return (
    <div className="min-h-screen bg-[#080F20] text-slate-100 flex flex-col md:flex-row relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-1/4 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0a1329]/90 border-r border-white/[0.08] backdrop-blur-xl z-20 shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.08]">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
              <FlaskConical size={21} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1">
                Lab<span className="text-cyan-400">Track</span>
              </h1>
              <p className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
                {isAdmin ? 'System Administrator' : 'Lab Assistant'}
              </p>
            </div>
          </Link>
        </div>

        {/* Assigned Lab Banner (For Assistants) */}
        {!isAdmin && assignedLab && (
          <div className="mx-4 my-3 p-3.5 rounded-xl bg-blue-500/[0.08] border border-blue-400/20 text-xs">
            <span className="text-cyan-400 font-bold block uppercase tracking-wider text-[9px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Assigned Laboratory
            </span>
            <div className="text-white font-semibold text-sm mt-1 truncate">
              {assignedLab.labName || 'Assigned Lab'}
            </div>
            <span className="text-slate-400 text-[11px] block mt-0.5 font-mono">
              Code: {assignedLab.labId || 'LAB'} • {assignedLab.labBlock || ''}
            </span>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
            Menu Navigation
          </p>
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/assistant'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-3 h-3 opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/[0.08] bg-black/20">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#0a1329] text-white p-4 flex items-center justify-between border-b border-white/[0.08] z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <FlaskConical size={18} />
          </div>
          <span className="font-bold text-sm tracking-tight">
            Lab<span className="text-cyan-400">Track</span>
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a1329]/95 border-b border-white/[0.08] px-4 py-4 space-y-2 z-30 backdrop-blur-xl">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl mt-3"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

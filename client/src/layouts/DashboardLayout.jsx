import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
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
  Wrench
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
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
            L
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">LAB TRACKER</h1>
            <p className="text-xs text-slate-400">Calibration & Faults</p>
          </div>
        </div>

        {/* Assigned Lab Banner (Strict Lab Isolation) */}
        {!isAdmin && assignedLab && (
          <div className="mx-4 my-3 p-3 rounded-lg bg-blue-950/60 border border-blue-800/40 text-xs">
            <span className="text-blue-400 font-semibold block uppercase tracking-wider text-[10px]">
              Assigned Laboratory
            </span>
            <div className="text-white font-medium text-sm mt-0.5 truncate">
              {assignedLab.labName || 'Assigned Lab'}
            </div>
            <span className="text-slate-400 text-[11px] block mt-0.5">
              Code: {assignedLab.labId || 'LAB'} • {assignedLab.labBlock || ''}
            </span>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/assistant'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-3">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 font-medium">
                {isAdmin ? <ShieldCheck className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-950/30 rounded-md transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
            L
          </div>
          <span className="font-bold text-sm tracking-wide">LAB TRACKER</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-slate-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
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
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-950/20 rounded-lg mt-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

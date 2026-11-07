import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Users,
  Cpu,
  AlertOctagon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers3,
  Clock,
  Sparkles
} from 'lucide-react';
import { OperationalStatusBadge } from '../../utils/statusBadges';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Top Banner (HomePage Aesthetic) */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              SYSTEM ADMINISTRATION
              <Sparkles className="w-3 h-3 text-cyan-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Institutional Overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Global management of university laboratories, assistant authorization, and system-wide equipment compliance metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/admin/labs"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
            >
              <Building2 className="w-4 h-4" />
              Manage Labs
            </Link>
            <Link
              to="/admin/assistants"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white rounded-xl text-xs font-bold transition-all transform hover:-translate-y-0.5"
            >
              <Users className="w-4 h-4 text-cyan-400" />
              Add Assistant
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Total Equipment */}
        <div className="relative rounded-2xl p-6 border border-white/10 bg-[#0e1a33]/80 backdrop-blur-xl shadow-xl hover:border-cyan-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Instruments
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/25 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">
            {stats ? stats.totalEquipment : '...'}
          </p>
          <span className="text-xs text-cyan-400 font-semibold block mt-1">
            Registered across all laboratories
          </span>
        </div>

        {/* Ready to Use */}
        <div className="relative rounded-2xl p-6 border border-white/10 bg-[#0e1a33]/80 backdrop-blur-xl shadow-xl hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ready to Use
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3">
            {stats ? stats.readyToUse : '...'}
          </p>
          <span className="text-xs text-slate-400 block mt-1">
            Available for student experiments
          </span>
        </div>

        {/* Damaged / In Repair */}
        <div className="relative rounded-2xl p-6 border border-white/10 bg-[#0e1a33]/80 backdrop-blur-xl shadow-xl hover:border-rose-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Damaged / Repair
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/25 text-rose-400 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-rose-400 mt-3">
            {stats ? stats.damaged + stats.underRepair : '...'}
          </p>
          <span className="text-xs text-rose-300 font-semibold block mt-1">
            {stats ? stats.openTickets : 0} open fault reports
          </span>
        </div>

        {/* Overdue Calibration */}
        <div className="relative rounded-2xl p-6 border border-white/10 bg-[#0e1a33]/80 backdrop-blur-xl shadow-xl hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Overdue Calibrations
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/25 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-400 mt-3">
            {stats ? stats.overdueCalibration : '...'}
          </p>
          <span className="text-xs text-amber-300 font-semibold block mt-1">
            Requires calibration update
          </span>
        </div>
      </div>

      {/* Frequently Damaged Instruments Table (Strict damageCount ranking) */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/[0.02]">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers3 className="w-4 h-4 text-cyan-400" />
              Most Frequently Damaged Instruments
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked in descending order of cumulative fault tickets to highlight hardware replacement requirements.
            </p>
          </div>
          <Link
            to="/admin/reports"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition self-start sm:self-auto"
          >
            Audit Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Equipment Details</th>
                <th className="px-6 py-4">Laboratory</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4 text-right">Lifetime Damage Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {stats?.mostDamagedEquipment && stats.mostDamagedEquipment.length > 0 ? (
                stats.mostDamagedEquipment.map((eq) => (
                  <tr key={eq._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block text-sm">{eq.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-300 font-medium block">{eq.labId?.labName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({eq.labId?.labId})</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{eq.location}</td>
                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold font-mono text-xs">
                        {eq.damageCount} {eq.damageCount === 1 ? 'fault' : 'faults'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                    No equipment damage records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

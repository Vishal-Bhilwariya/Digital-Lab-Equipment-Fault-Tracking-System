import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Building2, Users, Cpu, AlertOctagon, CheckCircle2, ArrowRight } from 'lucide-react';

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
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Administration</h2>
          <p className="text-xs text-slate-500 mt-1">
            Global management of University Laboratories, Assistant access, and high-level audit compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/labs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Building2 className="w-4 h-4" />
            Manage Labs
          </Link>
          <Link
            to="/admin/assistants"
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Users className="w-4 h-4" />
            Add Assistant
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Registered Equipment</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{stats ? stats.totalEquipment : '...'}</p>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">Across all laboratories</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ready to Use</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-3">{stats ? stats.readyToUse : '...'}</p>
          <span className="text-[11px] text-slate-500 block mt-1">Operational condition</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Damaged / In Repair</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-3">
            {stats ? stats.damaged + stats.underRepair : '...'}
          </p>
          <span className="text-[11px] text-rose-500 block mt-1">{stats ? stats.openTickets : 0} open fault tickets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overdue Calibrations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-3">{stats ? stats.overdueCalibration : '...'}</p>
          <span className="text-[11px] text-amber-600 block mt-1">Requires immediate notice</span>
        </div>
      </div>

      {/* Frequently Damaged Instruments Table (Highlighting Top Damage Counts) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Most Frequently Damaged Instruments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by cumulative fault damageCount (never resets) to assist replacement decisions
            </p>
          </div>
          <Link to="/admin/reports" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Reports <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Equipment</th>
                <th className="px-5 py-3">Laboratory</th>
                <th className="px-5 py-3">Serial Number</th>
                <th className="px-5 py-3">Operational Status</th>
                <th className="px-5 py-3 text-right">Lifetime Damage Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.mostDamagedEquipment && stats.mostDamagedEquipment.length > 0 ? (
                stats.mostDamagedEquipment.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-medium text-slate-900">{eq.name}</td>
                    <td className="px-5 py-3 text-slate-600">{eq.labId?.labName}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{eq.serialNumber}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {eq.operationalStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 font-bold font-mono">
                        {eq.damageCount} times
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No equipment damage records found
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

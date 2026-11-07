import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  CheckCircle2,
  AlertOctagon,
  Wrench,
  Clock,
  ArrowRight,
  Plus,
  QrCode
} from 'lucide-react';
import { OperationalStatusBadge } from '../../utils/statusBadges';

const AssistantDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/reports/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load assistant stats:', err);
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1">
            📍 Isolated Lab: {user?.assignedLab?.labName || 'Assigned Lab'} ({user?.assignedLab?.labId})
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lab Operations Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your laboratory's instruments, generate printable QR labels, log calibrations, and resolve fault tickets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/assistant/equipment"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </Link>
          <Link
            to="/assistant/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <AlertOctagon className="w-4 h-4" />
            Tickets Queue ({stats?.openTickets || 0})
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Equipment</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{stats ? stats.totalEquipment : '...'}</p>
          <span className="text-[11px] text-slate-400 block mt-1">In this laboratory</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Ready to Use</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-3">{stats ? stats.readyToUse : '...'}</p>
          <span className="text-[11px] text-emerald-600 font-medium block mt-1">Available for students</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Damaged / In Repair</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-3">
            {stats ? stats.damaged + stats.underRepair : '...'}
          </p>
          <span className="text-[11px] text-rose-500 block mt-1">{stats ? stats.openTickets : 0} unresolved tickets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Overdue Calibrations</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-3">{stats ? stats.overdueCalibration : '...'}</p>
          <span className="text-[11px] text-amber-600 block mt-1">Calibration expired</span>
        </div>
      </div>

      {/* Most Frequently Damaged Table (sorted by damageCount DESC) */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Highest Fault Frequency Instruments</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ranked by cumulative fault damageCount (never resets) to quickly highlight unreliable hardware
            </p>
          </div>
          <Link to="/assistant/equipment" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All Inventory <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Equipment Name</th>
                <th className="px-5 py-3">Serial Number</th>
                <th className="px-5 py-3">Bench Location</th>
                <th className="px-5 py-3">Operational Status</th>
                <th className="px-5 py-3 text-right">Lifetime Damage Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.mostDamagedEquipment && stats.mostDamagedEquipment.length > 0 ? (
                stats.mostDamagedEquipment.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">{eq.name}</td>
                    <td className="px-5 py-3 font-mono text-slate-500">{eq.serialNumber}</td>
                    <td className="px-5 py-3 text-slate-600">{eq.location}</td>
                    <td className="px-5 py-3">
                      <OperationalStatusBadge status={eq.operationalStatus} />
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
                    No equipment recorded yet.
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

export default AssistantDashboard;

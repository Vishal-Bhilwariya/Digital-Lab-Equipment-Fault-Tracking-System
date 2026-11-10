import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  Layers3,
  LayoutDashboard
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge, TicketStatusBadge } from '../../utils/statusBadges';

const AdminReports = () => {
  const [activeTab, setActiveTab] = useState('calibrated'); // 'calibrated' | 'damaged'
  const [calibratedData, setCalibratedData] = useState([]);
  const [damagedData, setDamagedData] = useState({ damagedEquipment: [], activeTickets: [] });
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [calRes, damRes] = await Promise.all([
        api.get('/reports/calibrated-equipment'),
        api.get('/reports/damaged-equipment')
      ]);
      setCalibratedData(calRes.data.data);
      setDamagedData(damRes.data.data);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            READ-ONLY AUDIT REPORTS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Institutional Compliance Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Global audit records across all campus laboratories. Modifications are strictly reserved for assigned Lab Assistants.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            Go to Main Dashboard
          </Link>
          <button
            onClick={fetchReports}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white rounded-xl text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-3">
        <button
          onClick={() => setActiveTab('calibrated')}
          className={`pb-3.5 text-xs font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'calibrated'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Calibrated Instruments ({calibratedData.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('damaged')}
          className={`pb-3.5 text-xs font-bold transition border-b-2 flex items-center gap-2 px-2 ${
            activeTab === 'damaged'
              ? 'border-rose-400 text-rose-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Damaged & Repair Ledger ({damagedData.damagedEquipment?.length || 0})</span>
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'calibrated' ? (
        <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Equipment Details</th>
                  <th className="px-6 py-4">Laboratory Department</th>
                  <th className="px-6 py-4">Bench Location</th>
                  <th className="px-6 py-4">Calibration Status</th>
                  <th className="px-6 py-4">Last Verified</th>
                  <th className="px-6 py-4">Next Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {calibratedData.length > 0 ? (
                  calibratedData.map((eq) => (
                    <tr key={eq._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block text-sm">{eq.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">
                          SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-cyan-300">{eq.labId?.labName}</span>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          {eq.labId?.labBlock} ({eq.labId?.labId})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{eq.location}</td>
                      <td className="px-6 py-4">
                        {eq.nextCalibrationDate ? (
                          <CalibrationStatusBadge
                            status={eq.calibrationHealth?.status}
                            daysRemaining={eq.calibrationHealth?.daysRemaining}
                          />
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-white/10">
                            Non-Calibrated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300">
                        {eq.lastCalibrationDate ? new Date(eq.lastCalibrationDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {eq.nextCalibrationDate ? new Date(eq.nextCalibrationDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                      No calibrated equipment found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Damaged Equipment Table */
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Damaged Hardware List
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Sorted by Lifetime Damage Count (Descending)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Equipment Details</th>
                    <th className="px-6 py-4">Laboratory</th>
                    <th className="px-6 py-4">Bench Location</th>
                    <th className="px-6 py-4">Operational Status</th>
                    <th className="px-6 py-4 text-center">Damage Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {damagedData.damagedEquipment?.length > 0 ? (
                    damagedData.damagedEquipment.map((eq) => (
                      <tr key={eq._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-white block text-sm">{eq.name}</span>
                          <span className="font-mono text-[11px] text-slate-400">
                            SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-cyan-300">{eq.labId?.labName}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">
                            {eq.labId?.labBlock} ({eq.labId?.labId})
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{eq.location}</td>
                        <td className="px-6 py-4">
                          <OperationalStatusBadge status={eq.operationalStatus} />
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-rose-400">
                          <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30">
                            {eq.damageCount}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                        No damaged equipment currently reported across university labs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;

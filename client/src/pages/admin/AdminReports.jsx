import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Sparkles,
  Layers3
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

        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white rounded-xl text-xs font-bold transition shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
          Refresh Ledger
        </button>
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
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          Calibrated Equipments ({calibratedData.length})
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
          Damaged & Repair Queue ({damagedData.damagedEquipment?.length || 0})
        </button>
      </div>

      {/* Tab 1: Calibrated Equipments */}
      {activeTab === 'calibrated' && (
        <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Equipment Details</th>
                  <th className="px-6 py-4">Laboratory</th>
                  <th className="px-6 py-4">Bench Location</th>
                  <th className="px-6 py-4">Last Calibrated</th>
                  <th className="px-6 py-4">Next Due Date</th>
                  <th className="px-6 py-4">Calibration Status</th>
                  <th className="px-6 py-4">Operational Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {calibratedData.length > 0 ? (
                  calibratedData.map((item) => (
                    <tr key={item._id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-white block text-sm">{item.name}</span>
                        <span className="font-mono text-[11px] text-slate-400">{item.serialNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-medium">
                        {item.labId?.labName}
                        <span className="block text-[10px] text-slate-400 font-mono">({item.labId?.labId})</span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{item.location}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {new Date(item.lastCalibrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-white">
                        {new Date(item.nextCalibrationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <CalibrationStatusBadge
                          status={item.calibrationHealth?.status}
                          daysRemaining={item.calibrationHealth?.daysRemaining}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <OperationalStatusBadge status={item.operationalStatus} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                      No calibration records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Damaged & Repair Queue */}
      {activeTab === 'damaged' && (
        <div className="space-y-7">
          
          {/* Damaged Instruments Table */}
          <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-5 bg-rose-500/[0.08] border-b border-rose-500/20 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                Damaged & Under Repair Instruments
              </span>
              <span className="text-[11px] text-rose-300 font-mono">
                Sorted by damageCount (Descending)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Instrument</th>
                    <th className="px-6 py-4">Laboratory</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Operational Status</th>
                    <th className="px-6 py-4 text-right">Lifetime Damage Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {damagedData.damagedEquipment?.length > 0 ? (
                    damagedData.damagedEquipment.map((eq) => (
                      <tr key={eq._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 font-bold text-white text-sm">{eq.name}</td>
                        <td className="px-6 py-4 text-slate-300">{eq.labId?.labName}</td>
                        <td className="px-6 py-4 text-slate-300">{eq.location}</td>
                        <td className="px-6 py-4">
                          <OperationalStatusBadge status={eq.operationalStatus} />
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-rose-300">
                          <span className="inline-block px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30">
                            {eq.damageCount} times
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-10 text-center text-slate-400">
                        No equipment currently marked as Damaged or Under Repair.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Fault Tickets Queue */}
          <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Layers3 className="w-4 h-4 text-cyan-400" />
                Active Fault Tickets Submitted by Students
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Equipment</th>
                    <th className="px-6 py-4">Student Reporter</th>
                    <th className="px-6 py-4">Fault Description</th>
                    <th className="px-6 py-4">Raised On</th>
                    <th className="px-6 py-4">Ticket Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {damagedData.activeTickets?.length > 0 ? (
                    damagedData.activeTickets.map((tkt) => (
                      <tr key={tkt._id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-sm">{tkt.ticketId}</td>
                        <td className="px-6 py-4 font-bold text-white">{tkt.equipmentId?.name}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {tkt.studentName} <span className="font-mono text-slate-400">({tkt.rollNumber})</span>
                        </td>
                        <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{tkt.description}</td>
                        <td className="px-6 py-4 text-slate-400">
                          {new Date(tkt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <TicketStatusBadge status={tkt.ticketStatus} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                        No active fault tickets in queue.
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

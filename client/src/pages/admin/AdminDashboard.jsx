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
  Sparkles,
  QrCode,
  Printer,
  X,
  Loader2
} from 'lucide-react';
import { OperationalStatusBadge } from '../../utils/statusBadges';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // QR Modal States
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

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

  const handleOpenQr = async (id) => {
    setQrData(null);
    setQrLoading(true);
    setShowQrModal(true);
    try {
      const res = await api.get(`/equipment/${id}/qr`);
      setQrData(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate QR code');
      setShowQrModal(false);
    } finally {
      setQrLoading(false);
    }
  };

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
        
        {/* Total Labs */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">
              Active Laboratories
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">
              {stats ? stats.totalLabs : '...'}
            </p>
            <span className="text-[11px] text-cyan-400 mt-1 block">Campus Facilities</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Total Assistants */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">
              Registered Assistants
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">
              {stats ? stats.totalAssistants : '...'}
            </p>
            <span className="text-[11px] text-blue-400 mt-1 block">Staff Accounts</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Equipment */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">
              Total Equipment
            </span>
            <p className="text-3xl font-extrabold text-white mt-1">
              {stats ? stats.totalEquipment : '...'}
            </p>
            <span className="text-[11px] text-emerald-400 mt-1 block">
              {stats ? stats.readyEquipment : '0'} Operational
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* Active Tickets */}
        <div className="p-6 rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase block">
              Active Fault Tickets
            </span>
            <p className="text-3xl font-extrabold text-rose-400 mt-1">
              {stats ? stats.openTickets : '...'}
            </p>
            <span className="text-[11px] text-rose-400/80 mt-1 block">Pending Investigation</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-400/20 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Compliance & Health Summary Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#0d182e]/90 to-[#122240]/90 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">System Compliance Rate</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.totalEquipment
                ? `${Math.round(((stats.readyEquipment || 0) / stats.totalEquipment) * 100)}% of laboratory hardware is verified and operational`
                : 'Loading metrics...'}
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Real-time Atlas Telemetry</span>
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
                <th className="px-6 py-4 text-center">Lifetime Damage Count</th>
                <th className="px-6 py-4 text-right">QR Code</th>
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
                    <td className="px-6 py-4 text-center">
                      <span className="inline-block px-3 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold font-mono text-xs">
                        {eq.damageCount} {eq.damageCount === 1 ? 'fault' : 'faults'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenQr(eq._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-xs font-semibold transition cursor-pointer"
                        title="View / Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No equipment damage records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Printable Modal for Admin Dashboard */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative text-white">
            <button
              onClick={() => { setShowQrModal(false); setQrData(null); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {qrLoading || !qrData ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                <p className="text-xs text-slate-400 font-mono">Generating high-contrast QR code...</p>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-base text-white">{qrData.equipmentName}</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">SN: {qrData.serialNumber}</p>
                <p className="text-xs text-cyan-400 mt-0.5">{qrData.labName} • {qrData.labBlock}</p>

                <div className="my-5 p-4 bg-white rounded-2xl inline-block shadow-xl">
                  <img src={qrData.qrCodeDataUrl} alt="Equipment QR Code" className="w-48 h-48 mx-auto" />
                </div>

                <p className="text-[11px] text-slate-400 font-mono break-all mb-4">
                  Public QR ID: <span className="text-cyan-300 font-bold">{qrData.publicId}</span>
                </p>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" />
                  Print QR Label
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

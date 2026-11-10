import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Cpu,
  AlertTriangle,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  QrCode,
  Printer
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge } from '../../utils/statusBadges';

const EquipmentPublicView = () => {
  const { publicId } = useParams();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await api.get(`/equipment/public/${publicId}`);
        setEquipment(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Equipment record not found or no longer active');
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, [publicId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080F20] flex items-center justify-center p-4 text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-400 font-mono">Retrieving equipment records...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-[#080F20] flex items-center justify-center p-4">
        <div className="bg-[#0f1d38] border border-white/15 rounded-3xl max-w-md w-full p-7 text-center shadow-2xl text-white">
          <div className="w-12 h-12 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3.5">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Equipment Record Not Found</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6 leading-relaxed">{error}</p>
          <Link
            to="/"
            className="inline-block px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-cyan-500/20"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isReady = equipment.operationalStatus === 'Ready to Use';

  return (
    <div className="min-h-screen bg-[#080F20] text-white py-10 px-4 flex flex-col justify-between relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold tracking-wider uppercase mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            Verified University Laboratory Instrument
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Equipment Health Profile
          </h1>
        </div>

        {/* Equipment Card */}
        <div className="bg-[#0f1d38]/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6">
          
          {/* Status Alert Banner */}
          {isReady ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-300">Instrument is Ready to Use</p>
                <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-relaxed">
                  Verified operational for student experiments. Report any unexpected faults immediately.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-rose-300">Do Not Power On / Under Inspection</p>
                <p className="text-[11px] text-rose-200/80 mt-0.5 leading-relaxed">
                  This instrument has been flagged for repair or damage inspection.
                </p>
              </div>
            </div>
          )}

          {/* Instrument Title & Info */}
          <div>
            <span className="font-mono text-xs text-cyan-400 block uppercase tracking-wider font-semibold">
              SN: {equipment.serialNumber} {equipment.model ? `• ${equipment.model}` : ''}
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">{equipment.name}</h2>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs border-t border-b border-white/10 py-5">
            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Laboratory</span>
              <p className="font-bold text-white mt-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                {equipment.labName}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">{equipment.labBlock} ({equipment.labId})</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Bench Location</span>
              <p className="font-bold text-white mt-1">{equipment.location}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Operational Status</span>
              <div className="mt-1.5">
                <OperationalStatusBadge status={equipment.operationalStatus} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Calibration Status</span>
              <div className="mt-1.5">
                <CalibrationStatusBadge
                  status={equipment.calibrationHealth?.status}
                  daysRemaining={equipment.calibrationHealth?.daysRemaining}
                />
              </div>
            </div>
          </div>

          {/* Calibration Notice */}
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Next Calibration Due:</span>
            <span className="font-mono font-bold text-white">
              {equipment.nextCalibrationDate ? new Date(equipment.nextCalibrationDate).toLocaleDateString() : 'N/A (Exempt)'}
            </span>
          </div>

          {/* QR Code Identification Card */}
          {equipment.qrCodeDataUrl && (
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="p-2 bg-white rounded-xl shrink-0 shadow-md">
                <img src={equipment.qrCodeDataUrl} alt="Equipment QR Code" className="w-16 h-16" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                  Verified Equipment QR Code
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  ID: <span className="text-cyan-300 font-bold">{equipment.publicId}</span>
                </p>
                <button
                  onClick={() => window.print()}
                  className="mt-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                >
                  <Printer className="w-3 h-3" />
                  Print / Save QR Label
                </button>
              </div>
            </div>
          )}

          {/* Action: Raise Ticket Button */}
          <div className="pt-1">
            <Link
              to={`/equipment/${equipment.publicId}/report`}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-rose-600/30 transform hover:-translate-y-0.5"
            >
              <Wrench className="w-4 h-4" />
              Report Fault / Damage (Raise Ticket)
            </Link>
          </div>
        </div>

        {/* Track Ticket Link */}
        <div className="text-center mt-6">
          <Link
            to="/login?role=Student"
            className="text-xs text-slate-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1.5 transition"
          >
            Already submitted a fault? Sign in as Student <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-500 py-4 mt-8 relative z-10">
        Local Lab Equipment Calibration & Fault Tracking System • Group G137
      </footer>
    </div>
  );
};

export default EquipmentPublicView;

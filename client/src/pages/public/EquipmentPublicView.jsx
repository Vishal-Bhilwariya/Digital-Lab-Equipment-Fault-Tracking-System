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
  ShieldCheck
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-500">Retrieving equipment records...</p>
        </div>
      </div>
    );
  }

  if (error || !equipment) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-center shadow-lg">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Equipment Record Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-5">{error}</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  const isReady = equipment.operationalStatus === 'Ready to Use';

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified University Laboratory Instrument
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Equipment Health Profile
          </h1>
        </div>

        {/* Equipment Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Status Alert Banner */}
          {isReady ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Equipment is Operational & Ready to Use</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Safe for student practical sessions. Please report any anomalies immediately.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold">Do Not Power On / Under Inspection</p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  This instrument has been flagged for repair or physical damage.
                </p>
              </div>
            </div>
          )}

          {/* Instrument Title & Info */}
          <div>
            <span className="font-mono text-[11px] text-slate-500 block uppercase tracking-wide">
              SN: {equipment.serialNumber} {equipment.model ? `• ${equipment.model}` : ''}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-0.5">{equipment.name}</h2>
          </div>

          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs border-t border-b border-slate-100 py-4">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Laboratory</span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                {equipment.labName}
              </p>
              <span className="text-[10px] text-slate-400">{equipment.labBlock} ({equipment.labId})</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Bench Location</span>
              <p className="font-semibold text-slate-800 mt-0.5">{equipment.location}</p>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Operational Status</span>
              <div className="mt-1">
                <OperationalStatusBadge status={equipment.operationalStatus} />
              </div>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Calibration Status</span>
              <div className="mt-1">
                <CalibrationStatusBadge
                  status={equipment.calibrationHealth?.status}
                  daysRemaining={equipment.calibrationHealth?.daysRemaining}
                />
              </div>
            </div>
          </div>

          {/* Calibration Notice */}
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Next Calibration Due:</span>
            <span className="font-semibold text-slate-700">
              {new Date(equipment.nextCalibrationDate).toLocaleDateString()}
            </span>
          </div>

          {/* Action: Raise Ticket Button */}
          <div className="pt-2">
            <Link
              to={`/equipment/${equipment.publicId}/report`}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-600/20"
            >
              <Wrench className="w-4 h-4" />
              Report Fault / Damage (Raise Ticket)
            </Link>
          </div>
        </div>

        {/* Track Ticket Link */}
        <div className="text-center mt-5">
          <Link
            to="/track-ticket"
            className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 transition"
          >
            Already submitted a fault? Track ticket status <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System
      </footer>
    </div>
  );
};

export default EquipmentPublicView;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  CalendarCheck2,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  X,
  PlusCircle,
  FileCheck2,
  ExternalLink,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { CalibrationStatusBadge, OperationalStatusBadge } from '../../utils/statusBadges';

const CalibrationSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLogModal, setShowLogModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Selected item
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Log Form states
  const [calibratedBy, setCalibratedBy] = useState('');
  const [calibrationDate, setCalibrationDate] = useState(new Date().toISOString().slice(0, 10));
  const [nextDueDate, setNextDueDate] = useState('');
  const [certificateUrl, setCertificateUrl] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/calibrations/schedule');
      setSchedule(res.data.data);
    } catch (err) {
      console.error('Failed to load calibration schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  // Open Log Calibration Modal
  const handleOpenLog = (item) => {
    setSelectedEquipment(item);
    setCalibratedBy('');
    setRemarks('');
    setCertificateUrl('');
    // Calculate default next due date from interval
    const intervalDays = item.calibrationIntervalDays || 180;
    const defaultNext = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    setNextDueDate(defaultNext);
    setShowLogModal(true);
  };

  // Open History Ledger Modal
  const handleOpenHistory = async (item) => {
    setSelectedEquipment(item);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await api.get(`/calibrations/equipment/${item._id}`);
      setHistoryLogs(res.data.data);
    } catch (err) {
      alert('Failed to load calibration history');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Submit Completed Calibration
  const handleSubmitCalibration = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      await api.post('/calibrations', {
        equipmentId: selectedEquipment._id,
        calibratedBy,
        calibrationDate,
        nextDueDate,
        certificateUrl,
        remarks
      });

      setShowLogModal(false);
      setSuccessMsg(`Permanent calibration log recorded for '${selectedEquipment.name}'. Schedule updated.`);
      fetchSchedule();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record calibration');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            URGENCY PRIORITY SORTING
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Calibration Schedule
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Prioritized by urgency formula: Overdue instruments top ➔ Due Today ➔ Upcoming sorted by fewest remaining days.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            Go to Main Dashboard
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Schedule Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Urgency Priority</th>
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Last Calibration</th>
                <th className="px-6 py-4">Next Due Date</th>
                <th className="px-6 py-4">Calibration Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-white/[0.03] transition-colors ${
                      item.priorityGroup === 1 ? 'bg-rose-500/[0.03]' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      {item.priorityGroup === 1 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <AlertTriangle className="w-3 h-3" /> Priority 1: Overdue
                        </span>
                      )}
                      {item.priorityGroup === 2 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Priority 2: Due Today
                        </span>
                      )}
                      {item.priorityGroup === 3 && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-400 bg-slate-800 border border-white/10">
                          Priority 3: Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block text-sm">{item.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{item.serialNumber}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{item.location}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.lastCalibrationDate ? new Date(item.lastCalibrationDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {item.nextCalibrationDate ? new Date(item.nextCalibrationDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <CalibrationStatusBadge
                        status={item.calibrationStatus}
                        daysRemaining={item.daysRemaining}
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {/* Log Calibration */}
                      <button
                        onClick={() => handleOpenLog(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-bold transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Log Calibration
                      </button>

                      {/* History */}
                      <button
                        onClick={() => handleOpenHistory(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-slate-300 rounded-lg text-xs font-semibold transition"
                      >
                        <History className="w-3.5 h-3.5 text-cyan-400" />
                        History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                    No calibration schedules available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Calibration Modal */}
      {showLogModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Record Completed Calibration</h3>
                <p className="text-xs text-slate-400">{selectedEquipment.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitCalibration} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Calibrated By (Technician / Agency)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Calibration Labs / Mr. Sharma"
                  value={calibratedBy}
                  onChange={(e) => setCalibratedBy(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Date Completed
                  </label>
                  <input
                    type="date"
                    required
                    value={calibrationDate}
                    onChange={(e) => setCalibrationDate(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Certificate Document Reference / URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://certificates.univ.edu/cal-998.pdf"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Calibration Remarks
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Voltage accuracy adjusted within 0.05% tolerance."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                ></textarea>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
                >
                  {submitLoading ? 'Logging...' : 'Save Permanent Calibration Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Ledger Modal */}
      {showHistoryModal && selectedEquipment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Calibration Audit Ledger</h3>
                <p className="text-xs text-slate-400">
                  {selectedEquipment.name} (SN: {selectedEquipment.serialNumber})
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div className="py-10 text-center text-xs text-slate-400">Loading ledger...</div>
            ) : historyLogs.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {historyLogs.map((log) => (
                  <div key={log._id} className="p-4 rounded-2xl border border-white/10 bg-[#081124] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">Calibrated by: {log.calibratedBy}</span>
                      <span className="text-[11px] text-cyan-400 font-mono">
                        {new Date(log.calibrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs">
                      Next Due Date Assigned: <span className="font-bold text-white">{new Date(log.nextDueDate).toLocaleDateString()}</span>
                    </p>
                    {log.remarks && (
                      <p className="text-slate-300 bg-white/[0.03] p-2.5 rounded-xl border border-white/10 text-xs italic">
                        "{log.remarks}"
                      </p>
                    )}
                    {log.certificateUrl && (
                      <a
                        href={log.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 text-xs inline-flex items-center gap-1 font-semibold"
                      >
                        View Certificate <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-xs text-slate-400">
                No past calibration records found for this equipment.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationSchedule;

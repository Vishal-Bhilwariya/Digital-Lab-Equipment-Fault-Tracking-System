import React, { useState, useEffect } from 'react';
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
  ExternalLink
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
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-1">
            <Clock className="w-3.5 h-3.5" />
            Urgency Priority Sorting
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Calibration Schedule</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically prioritized: Overdue instruments top ➔ Due Today ➔ Upcoming sorted by fewest remaining days.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Urgency Priority</th>
                <th className="px-5 py-3">Equipment</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Last Calibration</th>
                <th className="px-5 py-3">Next Due Date</th>
                <th className="px-5 py-3">Calibration Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-slate-50/80 transition ${
                      item.priorityGroup === 1 ? 'bg-rose-50/20' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      {item.priorityGroup === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> Priority 1: Overdue
                        </span>
                      )}
                      {item.priorityGroup === 2 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                          Priority 2: Due Today
                        </span>
                      )}
                      {item.priorityGroup === 3 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-600 bg-slate-100">
                          Priority 3: Upcoming
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-900 block">{item.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">{item.serialNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{item.location}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {new Date(item.lastCalibrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      {new Date(item.nextCalibrationDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <CalibrationStatusBadge
                        status={item.calibrationStatus}
                        daysRemaining={item.daysRemaining}
                      />
                    </td>
                    <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* Log Calibration */}
                      <button
                        onClick={() => handleOpenLog(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[11px] font-semibold transition"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        Log Calibration
                      </button>

                      {/* History */}
                      <button
                        onClick={() => handleOpenHistory(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                      >
                        <History className="w-3.5 h-3.5" />
                        History
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLogModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Record Completed Calibration</h3>
                <p className="text-xs text-slate-500">{selectedEquipment.name}</p>
              </div>
            </div>

            <form onSubmit={handleSubmitCalibration} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibrated By (Technician / Agency)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. National Calibration Labs / Mr. Sharma"
                  value={calibratedBy}
                  onChange={(e) => setCalibratedBy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date Completed</label>
                  <input
                    type="date"
                    required
                    value={calibrationDate}
                    onChange={(e) => setCalibrationDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Due Date</label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Certificate Document Reference / URL (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://certificates.univ.edu/cal-998.pdf"
                  value={certificateUrl}
                  onChange={(e) => setCertificateUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Calibration Remarks</label>
                <textarea
                  rows="2"
                  placeholder="e.g. Voltage accuracy adjusted within 0.05% tolerance."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setShowHistoryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Calibration Audit Ledger</h3>
                <p className="text-xs text-slate-500">
                  {selectedEquipment.name} (SN: {selectedEquipment.serialNumber})
                </p>
              </div>
            </div>

            {historyLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading ledger...</div>
            ) : historyLogs.length > 0 ? (
              <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                {historyLogs.map((log) => (
                  <div key={log._id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Calibrated by: {log.calibratedBy}</span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(log.calibrationDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Next Due Date Assigned: <span className="font-semibold text-slate-800">{new Date(log.nextDueDate).toLocaleDateString()}</span>
                    </p>
                    {log.remarks && (
                      <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px]">
                        "{log.remarks}"
                      </p>
                    )}
                    {log.certificateUrl && (
                      <a
                        href={log.certificateUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 text-[11px] inline-flex items-center gap-1 font-semibold"
                      >
                        View Certificate <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
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

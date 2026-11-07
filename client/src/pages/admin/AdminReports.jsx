import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FileSpreadsheet, ShieldAlert, CheckCircle2, AlertOctagon, Wrench, RefreshCw } from 'lucide-react';
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
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold mb-1">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            Read-Only Audit Reports
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Lab Audit Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Global compliance reports across all laboratories. Modifications are strictly reserved for assigned Lab Assistants.
          </p>
        </div>
        <button
          onClick={fetchReports}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4">
        <button
          onClick={() => setActiveTab('calibrated')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'calibrated'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Calibrated Equipments Ledger ({calibratedData.length})
        </button>
        <button
          onClick={() => setActiveTab('damaged')}
          className={`pb-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'damaged'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          Damaged & Under Repair Queue ({damagedData.damagedEquipment?.length || 0})
        </button>
      </div>

      {/* Tab 1: Calibrated Equipments */}
      {activeTab === 'calibrated' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3">Equipment</th>
                  <th className="px-5 py-3">Laboratory</th>
                  <th className="px-5 py-3">Location / Bench</th>
                  <th className="px-5 py-3">Last Calibrated</th>
                  <th className="px-5 py-3">Next Due Date</th>
                  <th className="px-5 py-3">Calibration Status</th>
                  <th className="px-5 py-3">Operational</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calibratedData.length > 0 ? (
                  calibratedData.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-900 block">{item.name}</span>
                        <span className="font-mono text-[11px] text-slate-500">{item.serialNumber}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {item.labId?.labName}
                        <span className="block text-[11px] text-slate-400">({item.labId?.labId})</span>
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
                          status={item.calibrationHealth?.status}
                          daysRemaining={item.calibrationHealth?.daysRemaining}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <OperationalStatusBadge status={item.operationalStatus} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                      No calibration records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Damaged Equipments & Faults */}
      {activeTab === 'damaged' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">
                Damaged & Under Repair Instruments
              </span>
              <span className="text-[11px] text-rose-700 font-semibold">
                Sorted by damageCount (Descending)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Instrument</th>
                    <th className="px-5 py-3">Laboratory</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Operational Status</th>
                    <th className="px-5 py-3 text-right">Lifetime Damage Count</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {damagedData.damagedEquipment?.length > 0 ? (
                    damagedData.damagedEquipment.map((eq) => (
                      <tr key={eq._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3 font-semibold text-slate-900">{eq.name}</td>
                        <td className="px-5 py-3 text-slate-600">{eq.labId?.labName}</td>
                        <td className="px-5 py-3 text-slate-600">{eq.location}</td>
                        <td className="px-5 py-3">
                          <OperationalStatusBadge status={eq.operationalStatus} />
                        </td>
                        <td className="px-5 py-3 text-right font-mono font-bold text-rose-600">
                          {eq.damageCount} times
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                        No equipment currently marked as Damaged or Under Repair!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Fault Tickets Queue */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-xs font-bold text-slate-900">Active Fault Tickets Submitted by Students</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-5 py-3">Ticket ID</th>
                    <th className="px-5 py-3">Equipment</th>
                    <th className="px-5 py-3">Reporter (Roll No)</th>
                    <th className="px-5 py-3">Fault Description</th>
                    <th className="px-5 py-3">Raised At</th>
                    <th className="px-5 py-3">Ticket Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {damagedData.activeTickets?.length > 0 ? (
                    damagedData.activeTickets.map((tkt) => (
                      <tr key={tkt._id} className="hover:bg-slate-50/80 transition">
                        <td className="px-5 py-3 font-mono font-bold text-blue-600">{tkt.ticketId}</td>
                        <td className="px-5 py-3 font-medium text-slate-900">{tkt.equipmentId?.name}</td>
                        <td className="px-5 py-3 text-slate-600">
                          {tkt.studentName} ({tkt.rollNumber})
                        </td>
                        <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{tkt.description}</td>
                        <td className="px-5 py-3 text-slate-500">
                          {new Date(tkt.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3">
                          <TicketStatusBadge status={tkt.ticketStatus} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
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

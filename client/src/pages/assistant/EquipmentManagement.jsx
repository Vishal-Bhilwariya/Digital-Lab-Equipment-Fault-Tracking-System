import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Cpu,
  Plus,
  QrCode,
  Edit2,
  Archive,
  Printer,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  ExternalLink,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge } from '../../utils/statusBadges';

const EquipmentManagement = () => {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Active QR state
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);

  // Active Edit state
  const [selectedItem, setSelectedItem] = useState(null);
  const [editStatus, setEditStatus] = useState('Ready to Use');
  const [editLocation, setEditLocation] = useState('');

  // Add Form states (Requirement 4.A)
  const todayStr = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [additionDate, setAdditionDate] = useState(todayStr);
  const [requiresCalibration, setRequiresCalibration] = useState(true);
  const [calibrationIntervalDays, setCalibrationIntervalDays] = useState(180);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEquipment = async () => {
    try {
      const res = await api.get(`/equipment?search=${search}`);
      setEquipment(res.data.data || []);
    } catch (err) {
      console.error('Failed to load equipment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [search]);

  // Open QR Modal
  const handleOpenQr = async (id) => {
    setQrLoading(true);
    setShowQrModal(true);
    try {
      const res = await api.get(`/equipment/${id}/qr`);
      setQrData(res.data.data);
    } catch (err) {
      alert('Failed to generate QR code');
      setShowQrModal(false);
    } finally {
      setQrLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditStatus(item.operationalStatus);
    setEditLocation(item.location);
    setShowEditModal(true);
  };

  // Submit Edit
  const handleUpdateEquipment = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/equipment/${selectedItem._id}`, {
        operationalStatus: editStatus,
        location: editLocation
      });
      setShowEditModal(false);
      setSuccessMsg(`Equipment '${selectedItem.name}' updated successfully.`);
      fetchEquipment();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update equipment');
    }
  };

  // Submit Add Equipment (Requirement 4.A)
  const handleCreateEquipment = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      await api.post('/equipment', {
        name,
        serialNumber,
        model,
        location,
        additionDate,
        calibrationIntervalDays: requiresCalibration ? Number(calibrationIntervalDays) : null
      });

      setShowAddModal(false);
      setName('');
      setSerialNumber('');
      setModel('');
      setLocation('');
      setAdditionDate(todayStr);
      setRequiresCalibration(true);
      setCalibrationIntervalDays(180);
      setSuccessMsg(`Equipment registered with damageCount=0 and unique Public QR ID.`);
      fetchEquipment();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Archive Equipment
  const handleArchive = async (id, eqName) => {
    if (!window.confirm(`Are you sure you want to archive '${eqName}'? Fault history will be preserved.`)) return;

    try {
      await api.patch(`/equipment/${id}/archive`);
      fetchEquipment();
      setSuccessMsg(`Equipment '${eqName}' archived successfully.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to archive equipment');
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            LABORATORY INVENTORY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Equipment Inventory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Registered for <span className="text-white font-semibold">{user?.assignedLab?.labName || 'Your Assigned Laboratory'}</span>. Sorted by lifetime damage count.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Go to Main Dashboard Button (Requirement 4.B) */}
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            Go to Main Dashboard
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Count Bar */}
      <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by equipment name or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#081124] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
        <span className="text-xs font-semibold text-slate-400 font-mono">
          Showing <span className="text-cyan-400 font-bold">{equipment.length}</span> instruments in inventory
        </span>
      </div>

      {/* Equipment Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Equipment Details</th>
                <th className="px-6 py-4">Bench Location</th>
                <th className="px-6 py-4">Added On</th>
                <th className="px-6 py-4">Operational Status</th>
                <th className="px-6 py-4">Calibration Status</th>
                <th className="px-6 py-4 text-center">Damage Count</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {equipment.length > 0 ? (
                equipment.map((eq) => (
                  <tr key={eq._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block text-sm">{eq.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">
                        SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">{eq.location}</td>
                    <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                      {eq.additionDate || eq.installationDate
                        ? new Date(eq.additionDate || eq.installationDate).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
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
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-bold font-mono border ${
                          eq.damageCount > 0
                            ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                            : 'bg-slate-800 border-white/10 text-slate-300'
                        }`}
                      >
                        {eq.damageCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenQr(eq._id)}
                        title="View / Print QR Code"
                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-400/20 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        title="Edit Status / Location"
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-400/20 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchive(eq._id, eq.name)}
                        title="Archive Equipment"
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                    No equipment found in inventory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Equipment Modal (Requirement 4.A) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Register Lab Equipment</h3>
                <p className="text-xs text-slate-400">Registers into your assigned laboratory automatically</p>
              </div>
            </div>

            {/* Auto-detected Laboratory Display (Requirement 4.A.2 & 4.A.3) */}
            <div className="mb-4 p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                  Assigned Laboratory (Auto-Enforced)
                </span>
                <span className="font-bold text-white text-sm">
                  {user?.assignedLab?.labName || 'Assigned Laboratory'}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-black/40 text-cyan-300 font-mono text-[11px] border border-cyan-400/20">
                {user?.assignedLab?.labId || 'LAB'}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Equipment Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Digital Storage Oscilloscope"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEK-2024-001"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Model / Specification
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tektronix TBS1102B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Bench / Physical Location
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bench 04, Room 102"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Equipment Addition Date (Requirement 4.A.1) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Equipment Addition Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-cyan-400 absolute left-3.5 top-2.5" />
                  <input
                    type="date"
                    required
                    value={additionDate}
                    onChange={(e) => setAdditionDate(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              {/* Optional Calibration Interval (Requirement 4.A.5 & 4.A.6) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresCalibration}
                    onChange={(e) => setRequiresCalibration(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-0 bg-[#081124] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    Requires Periodic Calibration Verification
                  </span>
                </label>

                {requiresCalibration && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Calibration Interval (Days)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      required={requiresCalibration}
                      value={calibrationIntervalDays}
                      onChange={(e) => setCalibrationIntervalDays(e.target.value)}
                      placeholder="e.g. 180"
                      className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Default is 180 days (~6 months). Leave unchecked for non-calibrated furniture/tools.
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  {submitLoading ? 'Registering...' : 'Register Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditModal && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">Update Equipment</h3>
            <p className="text-xs text-slate-400 mb-5">{selectedItem.name}</p>

            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Operational Status (Independent from Calibration)
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Ready to Use" className="bg-slate-900 text-white">Ready to Use</option>
                  <option value="Under Repair" className="bg-slate-900 text-white">Under Repair</option>
                  <option value="Damaged" className="bg-slate-900 text-white">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Location / Bench
                </label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Printable Modal */}
      {showQrModal && qrData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl relative text-white">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              <Printer className="w-4 h-4" />
              Print QR Label
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentManagement;

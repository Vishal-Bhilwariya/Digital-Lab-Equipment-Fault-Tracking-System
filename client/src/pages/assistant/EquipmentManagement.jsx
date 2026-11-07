import React, { useState, useEffect } from 'react';
import api from '../../services/api';
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
  Sparkles
} from 'lucide-react';
import { OperationalStatusBadge, CalibrationStatusBadge } from '../../utils/statusBadges';

const EquipmentManagement = () => {
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

  // Add Form states
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [model, setModel] = useState('');
  const [location, setLocation] = useState('');
  const [calibrationIntervalDays, setCalibrationIntervalDays] = useState(180);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEquipment = async () => {
    try {
      const res = await api.get(`/equipment?search=${search}`);
      setEquipment(res.data.data);
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

  // Submit Add
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
        calibrationIntervalDays: Number(calibrationIntervalDays)
      });

      setShowAddModal(false);
      setName('');
      setSerialNumber('');
      setModel('');
      setLocation('');
      setSuccessMsg(`Equipment registered with damageCount=0 and unique Public QR ID.`);
      fetchEquipment();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add equipment');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Archive
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
            Sorted in descending order of lifetime damageCount to instantly prioritize hardware inspection and replacement.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Equipment
        </button>
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
                    <td className="px-6 py-4">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
                    <td className="px-6 py-4">
                      <CalibrationStatusBadge
                        status={eq.calibrationHealth?.status}
                        daysRemaining={eq.calibrationHealth?.daysRemaining}
                      />
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
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      {/* Generate QR Button */}
                      <button
                        onClick={() => handleOpenQr(eq._id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 rounded-lg text-xs font-bold transition"
                        title="Generate & Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR Sticker
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-slate-200 rounded-lg text-xs font-semibold transition"
                        title="Update Status / Location"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                        Edit
                      </button>

                      {/* Archive Button */}
                      <button
                        onClick={() => handleArchive(eq._id, eq.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 rounded-lg text-xs font-semibold transition"
                        title="Archive Equipment"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No equipment found. Click "Add Equipment" to register your first instrument.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal (High-Contrast Printable Sticker) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-sm p-6 sm:p-7 shadow-2xl relative text-center text-white">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-white mb-1">Equipment QR Sticker</h3>
            <p className="text-xs text-slate-400 mb-5">
              Print and affix this sticker onto the physical equipment casing.
            </p>

            {qrLoading || !qrData ? (
              <div className="py-12 text-slate-400 text-xs">Generating QR...</div>
            ) : (
              <div>
                <div
                  id="printable-qr"
                  className="bg-white text-slate-900 border-2 border-slate-900 rounded-2xl p-5 inline-block shadow-lg mb-5"
                >
                  <p className="text-[11px] font-black tracking-widest text-slate-900 uppercase">
                    {qrData.labName}
                  </p>
                  <img
                    src={qrData.qrDataUrl}
                    alt="Equipment QR Code"
                    className="w-48 h-48 mx-auto my-2 border border-slate-200 rounded-xl"
                  />
                  <p className="font-bold text-xs text-slate-900 truncate max-w-[200px] mx-auto">
                    {qrData.name}
                  </p>
                  <p className="font-mono text-[10px] text-slate-600">SN: {qrData.serialNumber}</p>
                  <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-tight font-bold">
                    Scan via Google Lens
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition"
                  >
                    <Printer className="w-4 h-4" />
                    Print Sticker Label
                  </button>

                  <a
                    href={qrData.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Open Public Mobile View <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
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
                <h3 className="font-bold text-lg text-white">Register Equipment</h3>
                <p className="text-xs text-slate-400">Initializes damageCount=0 and generates QR code</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Equipment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Storage Oscilloscope 100MHz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEK-2024-902"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Model (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TBS1102B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Bench / Room Location
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bench 04, Electronics Lab"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Calibration Interval (Days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={calibrationIntervalDays}
                  onChange={(e) => setCalibrationIntervalDays(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
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
    </div>
  );
};

export default EquipmentManagement;

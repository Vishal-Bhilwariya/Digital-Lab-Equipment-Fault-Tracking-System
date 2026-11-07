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
  ExternalLink
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
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Equipment Inventory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Sorted by lifetime damageCount (Descending) to instantly highlight frequently broken hardware.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Equipment
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by equipment name or serial number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>
        <span className="text-[11px] font-medium text-slate-500 whitespace-nowrap">
          {equipment.length} items in inventory
        </span>
      </div>

      {/* Equipment Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Equipment Details</th>
                <th className="px-5 py-3">Location / Bench</th>
                <th className="px-5 py-3">Operational Status</th>
                <th className="px-5 py-3">Calibration Status</th>
                <th className="px-5 py-3 text-center">Damage Count</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {equipment.length > 0 ? (
                equipment.map((eq) => (
                  <tr key={eq._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3">
                      <span className="font-bold text-slate-900 block">{eq.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        SN: {eq.serialNumber} {eq.model ? `• ${eq.model}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 font-medium">{eq.location}</td>
                    <td className="px-5 py-3">
                      <OperationalStatusBadge status={eq.operationalStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <CalibrationStatusBadge
                        status={eq.calibrationHealth?.status}
                        daysRemaining={eq.calibrationHealth?.daysRemaining}
                      />
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
                          eq.damageCount > 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {eq.damageCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                      {/* Generate QR Button */}
                      <button
                        onClick={() => handleOpenQr(eq._id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-[11px] font-semibold transition"
                        title="Generate & Print QR Code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        QR Label
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(eq)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition"
                        title="Update Status / Location"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>

                      {/* Archive Button */}
                      <button
                        onClick={() => handleArchive(eq._id, eq.name)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[11px] font-semibold transition"
                        title="Archive Equipment"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 mb-1">Equipment QR Sticker</h3>
            <p className="text-xs text-slate-500 mb-4">
              Print and affix this label onto the physical equipment casing.
            </p>

            {qrLoading || !qrData ? (
              <div className="py-12 text-slate-400 text-xs">Generating QR...</div>
            ) : (
              <div>
                <div
                  id="printable-qr"
                  className="bg-white border-2 border-slate-900 rounded-xl p-4 inline-block shadow-sm mb-4"
                >
                  <p className="text-[11px] font-black tracking-widest text-slate-900 uppercase">
                    {qrData.labName}
                  </p>
                  <img
                    src={qrData.qrDataUrl}
                    alt="Equipment QR Code"
                    className="w-48 h-48 mx-auto my-2 border border-slate-200 rounded-lg"
                  />
                  <p className="font-bold text-xs text-slate-900 truncate max-w-[200px] mx-auto">
                    {qrData.name}
                  </p>
                  <p className="font-mono text-[10px] text-slate-600">SN: {qrData.serialNumber}</p>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tight font-semibold">
                    Scan via Google Lens
                  </p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition"
                  >
                    <Printer className="w-4 h-4" />
                    Print Sticker Label
                  </button>

                  <a
                    href={qrData.targetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Register New Equipment</h3>
                <p className="text-xs text-slate-500">Auto-initializes damageCount=0 and creates QR link</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateEquipment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Digital Storage Oscilloscope 100MHz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TEK-2024-902"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. TBS1102B"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bench / Room Location</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bench 04, Electronics Lab"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Calibration Interval (Days)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={calibrationIntervalDays}
                  onChange={(e) => setCalibrationIntervalDays(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Standard interval (e.g. 180 days = 6 months)
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-base text-slate-900 mb-1">Update Equipment</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedItem.name}</p>

            <form onSubmit={handleUpdateEquipment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status (Independent from Calibration)
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Ready to Use">Ready to Use</option>
                  <option value="Under Repair">Under Repair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Location / Bench</label>
                <input
                  type="text"
                  required
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
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

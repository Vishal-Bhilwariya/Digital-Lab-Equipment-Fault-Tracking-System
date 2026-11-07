import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Building2, Plus, Archive, CheckCircle2, AlertCircle, X } from 'lucide-react';

const ManageLabs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [labName, setLabName] = useState('');
  const [labBlock, setLabBlock] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchLabs = async () => {
    try {
      const res = await api.get('/labs?includeArchived=true');
      setLabs(res.data.data);
    } catch (err) {
      console.error('Failed to load labs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  const handleCreateLab = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    try {
      await api.post('/labs', { labName, labBlock });
      setSuccessMsg(`Laboratory '${labName}' registered with an auto-generated Lab ID.`);
      setLabName('');
      setLabBlock('');
      setShowAddModal(false);
      fetchLabs();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create laboratory');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleArchiveLab = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive '${name}'? Existing equipment and tickets will remain safe for audit compliance.`)) {
      return;
    }

    try {
      await api.patch(`/labs/${id}/archive`);
      fetchLabs();
      setSuccessMsg(`Laboratory '${name}' has been safely archived.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive lab');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laboratories Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Create physical laboratory departments. The system auto-generates unique string identifiers (e.g. LAB-A8F21).
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add New Laboratory
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Labs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Lab ID</th>
                <th className="px-5 py-3">Laboratory Name</th>
                <th className="px-5 py-3">Block / Building</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labs.length > 0 ? (
                labs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-mono font-bold text-blue-600">{lab.labId}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{lab.labName}</td>
                    <td className="px-5 py-3 text-slate-600">{lab.labBlock}</td>
                    <td className="px-5 py-3">
                      {lab.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {lab.isActive && (
                        <button
                          onClick={() => handleArchiveLab(lab._id, lab.labName)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded transition"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-400">
                    No laboratories found. Click "Add New Laboratory" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lab Modal */}
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
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Add New Laboratory</h3>
                <p className="text-xs text-slate-500">System will automatically assign a unique Lab ID</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateLab} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Laboratory Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Laboratory 1"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Block / Building</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C, 2nd Floor"
                  value={labBlock}
                  onChange={(e) => setLabBlock(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
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
                  {submitLoading ? 'Registering...' : 'Create Laboratory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageLabs;

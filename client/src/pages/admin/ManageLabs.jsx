import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Building2,
  Plus,
  Archive,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  LayoutDashboard,
  Search
} from 'lucide-react';

const ManageLabs = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [labName, setLabName] = useState('');
  const [labBlock, setLabBlock] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'ARCHIVED'
  const [search, setSearch] = useState('');

  const fetchLabs = async () => {
    try {
      const res = await api.get('/labs?includeArchived=true');
      setLabs(res.data.data || []);
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
      setSuccessMsg(`Laboratory '${labName}' registered with an auto-generated unique Lab ID.`);
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

  // Archive Laboratory (Soft-delete)
  const handleArchiveLab = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to archive '${name}'? Existing equipment and records remain safe for audit compliance.`
      )
    ) {
      return;
    }

    try {
      await api.patch(`/labs/${id}/archive?force=true`);
      fetchLabs();
      setSuccessMsg(`Laboratory '${name}' has been safely archived.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive lab');
    }
  };

  // Restore / Unarchive Laboratory (Requirement 3.B)
  const handleRestoreLab = async (id, name) => {
    try {
      await api.patch(`/labs/${id}/reactivate`);
      fetchLabs();
      setSuccessMsg(`Laboratory '${name}' has been restored and moved back to active list.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore laboratory');
    }
  };

  const filteredLabs = labs.filter((l) => {
    const matchesSearch =
      l.labName.toLowerCase().includes(search.toLowerCase()) ||
      l.labId.toLowerCase().includes(search.toLowerCase()) ||
      l.labBlock.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'ACTIVE') return matchesSearch && l.isActive;
    if (statusFilter === 'ARCHIVED') return matchesSearch && !l.isActive;
    return matchesSearch;
  });

  const activeCount = labs.filter((l) => l.isActive).length;
  const archivedCount = labs.filter((l) => !l.isActive).length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            LABORATORY REGISTRY
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Laboratories Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Create and maintain physical laboratory departments. Safely archive and restore labs anytime with full data preservation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Link
            to="/admin"
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
            Add New Laboratory
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter Tabs and Search Bar */}
      <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by lab name, code, or building block..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#081124] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Filter Tabs (All / Active / Archived) */}
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            All Labs ({labs.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('ARCHIVED')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              statusFilter === 'ARCHIVED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Labs Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Lab ID (Auto-Generated)</th>
                <th className="px-6 py-4">Laboratory Name</th>
                <th className="px-6 py-4">Block / Building</th>
                <th className="px-6 py-4">Active Equipment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {filteredLabs.length > 0 ? (
                filteredLabs.map((lab) => (
                  <tr key={lab._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-sm">{lab.labId}</td>
                    <td className="px-6 py-4 font-bold text-white text-sm">{lab.labName}</td>
                    <td className="px-6 py-4 text-slate-300">{lab.labBlock}</td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {lab.equipmentCount !== undefined ? lab.equipmentCount : '—'}
                    </td>
                    <td className="px-6 py-4">
                      {lab.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          <Archive className="w-3.5 h-3.5" />
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {lab.isActive ? (
                        <button
                          onClick={() => handleArchiveLab(lab._id, lab.labName)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestoreLab(lab._id, lab.labName)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Restore Lab
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No laboratories found. Click "Add New Laboratory" to register your first lab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lab Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Add New Laboratory</h3>
                <p className="text-xs text-slate-400">System will assign a unique identifier</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateLab} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Laboratory Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Laboratory 1"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Block / Building
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block C, 2nd Floor"
                  value={labBlock}
                  onChange={(e) => setLabBlock(e.target.value)}
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

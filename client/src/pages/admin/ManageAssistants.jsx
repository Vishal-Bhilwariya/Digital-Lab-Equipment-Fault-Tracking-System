import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Plus,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Link as LinkIcon,
  Building2,
  Loader2,
  UserX,
  UserCheck
} from 'lucide-react';

const ManageAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [tableError, setTableError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [assignedLabId, setAssignedLabId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const fetchData = async () => {
    try {
      const [astRes, labRes] = await Promise.all([
        api.get('/users/assistants'),
        api.get('/labs')
      ]);
      setAssistants(astRes.data.data || []);
      setLabs(labRes.data.data || []);
    } catch (err) {
      console.error('Failed to load assistants:', err);
      setTableError(err.response?.data?.message || 'Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitLoading(true);

    try {
      const res = await api.post('/users/assistants', {
        name,
        email,
        mobile,
        assignedLabId
      });

      setSuccessInfo(res.data.data);
      setName('');
      setEmail('');
      setMobile('');
      setAssignedLabId('');
      setShowAddModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add lab assistant');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} this assistant?`)) return;

    setTogglingId(id);
    setTableError('');
    try {
      await api.patch(`/users/assistants/${id}/status`);
      // Optimistically update UI immediately without full re-fetch
      setAssistants((prev) =>
        prev.map((a) =>
          (a._id === id || a.id === id) ? { ...a, isActive: !a.isActive } : a
        )
      );
    } catch (err) {
      setTableError(err.response?.data?.message || `Failed to ${action} assistant. Please try again.`);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">

      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            STAFF AUTHORIZATION
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lab Assistants Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Assign technicians to specific laboratories. Account setup invitations are dispatched via Nodemailer with secure password links.
          </p>
        </div>

        <button
          onClick={() => { setShowAddModal(true); setSuccessInfo(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Lab Assistant
        </button>
      </div>

      {/* Success Banner */}
      {successInfo && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs space-y-3">
          <div className="flex items-center gap-2.5 font-bold text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Assistant '{successInfo.name}' registered & assigned to {successInfo.assignedLab?.labName || 'lab'}!</span>
          </div>
          {successInfo.setupUrl && (
            <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 font-mono text-[11px] break-all">
              <span className="font-bold text-emerald-400 block mb-1">Password Setup URL (Dev Only — share this with assistant):</span>
              <a href={successInfo.setupUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 shrink-0" /> {successInfo.setupUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Table Error Banner */}
      {tableError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{tableError}</span>
          <button onClick={() => setTableError('')} className="ml-auto text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Assistants Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Assistant Name</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Mobile</th>
                <th className="px-6 py-4">Assigned Laboratory (Isolation)</th>
                <th className="px-6 py-4">Account Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading assistants...
                    </div>
                  </td>
                </tr>
              ) : assistants.length > 0 ? (
                assistants.map((ast) => {
                  const astId = ast._id || ast.id;
                  const isToggling = togglingId === astId;
                  return (
                    <tr key={astId} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm">{ast.name}</td>
                      <td className="px-6 py-4 text-slate-300">
                        <span className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          {ast.email}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono">
                        <span className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          {ast.mobile}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-blue-500/15 border border-blue-400/25 text-cyan-300">
                          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                          {ast.assignedLabId?.labName || 'Unassigned'}{' '}
                          ({ast.assignedLabId?.labId || 'N/A'})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {ast.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(astId, ast.isActive)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            ast.isActive
                              ? 'text-rose-300 hover:text-white bg-rose-500/15 hover:bg-rose-500/30 border-rose-500/30'
                              : 'text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/30 border-emerald-500/30'
                          }`}
                        >
                          {isToggling ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : ast.isActive ? (
                            <UserX className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          {isToggling ? 'Updating...' : ast.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                      <Users className="w-10 h-10 opacity-30" />
                      <p className="text-sm">No lab assistants registered yet.</p>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold underline underline-offset-2"
                      >
                        Add the first assistant →
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assistant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl relative text-white">
            <button
              onClick={() => { setShowAddModal(false); setFormError(''); }}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Add Lab Assistant</h3>
                <p className="text-xs text-slate-400">Assign to an active lab & trigger setup email</p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssistant} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.ece@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assign to Laboratory (Strict Isolation)
                </label>
                <select
                  required
                  value={assignedLabId}
                  onChange={(e) => setAssignedLabId(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="" className="bg-slate-900 text-slate-400">-- Select Laboratory --</option>
                  {labs.map((l) => (
                    <option key={l._id} value={l._id} className="bg-slate-900 text-white">
                      {l.labName} ({l.labId} - {l.labBlock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setFormError(''); }}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  {submitLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {submitLoading ? 'Registering...' : 'Add Assistant & Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAssistants;

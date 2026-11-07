import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Plus, Mail, Phone, CheckCircle2, AlertCircle, X, ShieldAlert, Link as LinkIcon } from 'lucide-react';

const ManageAssistants = () => {
  const [assistants, setAssistants] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [assignedLabId, setAssignedLabId] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const fetchData = async () => {
    try {
      const [astRes, labRes] = await Promise.all([
        api.get('/users/assistants'),
        api.get('/labs')
      ]);
      setAssistants(astRes.data.data);
      setLabs(labRes.data.data);
    } catch (err) {
      console.error('Failed to load assistants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssistant = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.message || 'Failed to add lab assistant');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/users/assistants/${id}/status`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update assistant status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lab Assistants Directory</h2>
          <p className="text-xs text-slate-500 mt-1">
            Assign technicians to specific laboratories. Invitations are dispatched via Nodemailer with secure password-setup links.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Lab Assistant
        </button>
      </div>

      {successInfo && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Assistant '{successInfo.name}' registered & assigned to {successInfo.assignedLab?.labName}!</span>
          </div>
          {successInfo.setupUrl && (
            <div className="p-2.5 rounded bg-emerald-100/70 border border-emerald-300 font-mono text-[11px] break-all">
              <span className="font-bold text-emerald-900 block mb-1">Generated Password Setup URL (Demo):</span>
              <a href={successInfo.setupUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 inline" /> {successInfo.setupUrl}
              </a>
            </div>
          )}
        </div>
      )}

      {/* Assistants Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Assistant Name</th>
                <th className="px-5 py-3">Contact Email</th>
                <th className="px-5 py-3">Mobile</th>
                <th className="px-5 py-3">Assigned Laboratory (Isolation)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assistants.length > 0 ? (
                assistants.map((ast) => (
                  <tr key={ast._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-semibold text-slate-900">{ast.name}</td>
                    <td className="px-5 py-3 text-slate-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {ast.email}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {ast.mobile}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        {ast.assignedLabId?.labName || 'Unassigned'} ({ast.assignedLabId?.labId || 'N/A'})
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {ast.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          Deactivated
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleToggleStatus(ast._id, ast.isActive)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded transition ${
                          ast.isActive
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {ast.isActive ? 'Deactivate' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                    No lab assistants registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Assistant Modal */}
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
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Add Lab Assistant</h3>
                <p className="text-xs text-slate-500">Assign to an active lab & trigger setup email</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateAssistant} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh.ece@univ.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Laboratory (Strict Isolation)
                </label>
                <select
                  required
                  value={assignedLabId}
                  onChange={(e) => setAssignedLabId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">-- Select Laboratory --</option>
                  {labs.map((l) => (
                    <option key={l._id} value={l._id}>
                      {l.labName} ({l.labId} - {l.labBlock})
                    </option>
                  ))}
                </select>
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

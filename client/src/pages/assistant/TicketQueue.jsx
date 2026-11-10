import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  AlertOctagon,
  Clock,
  Wrench,
  CheckCircle2,
  X,
  Eye,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Sparkles,
  LayoutDashboard
} from 'lucide-react';
import { TicketStatusBadge, OperationalStatusBadge } from '../../utils/statusBadges';

const TicketQueue = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('active'); // 'active' | 'all' | 'Resolved'
  const [loading, setLoading] = useState(true);

  // Selected Ticket Modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Status update form states
  const [newStatus, setNewStatus] = useState('Under Review');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [restoreOperational, setRestoreOperational] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchTickets = async () => {
    try {
      const res = await api.get(`/tickets?status=${filter}`);
      setTickets(res.data.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filter]);

  const handleOpenDetail = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.ticketStatus);
    setResolutionNotes(ticket.resolutionNotes || '');
    setRestoreOperational(true);
    setShowModal(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.patch(`/tickets/${selectedTicket._id}/status`, {
        ticketStatus: newStatus,
        resolutionNotes,
        restoreOperationalStatus: restoreOperational
      });

      setShowModal(false);
      setSuccessMsg(`Ticket ${selectedTicket.ticketId} updated to '${newStatus}' and student notified via email.`);
      fetchTickets();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-7">
      
      {/* Header Banner */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#111f38]/90 via-[#0d192e]/90 to-[#0a1426]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
            REPAIR QUEUE LIFECYCLE
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Damaged Equipment & Fault Tickets
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Review student fault reports with photographic evidence. Automated email notifications sent to students upon status transition.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start sm:self-auto">
          {/* Go to Main Dashboard Button (Requirement 4.B) */}
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            Go to Main Dashboard
          </Link>

          {/* Filter buttons */}
          <div className="inline-flex rounded-xl border border-white/15 bg-[#081124] p-1.5">
            <button
              onClick={() => setFilter('active')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'active'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Faults
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All History
            </button>
            <button
              onClick={() => setFilter('Resolved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                filter === 'Resolved'
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resolved Only
            </button>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tickets Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-4">Ticket ID</th>
                <th className="px-6 py-4">Equipment Damaged</th>
                <th className="px-6 py-4">Student Details</th>
                <th className="px-6 py-4">Reported Date</th>
                <th className="px-6 py-4">Current Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {tickets.length > 0 ? (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-cyan-400 text-sm">
                      {ticket.ticketId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white block text-sm">
                        {ticket.equipmentId?.name || 'Equipment'}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Location: {ticket.equipmentId?.location || 'Lab'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <span className="font-semibold text-white block">{ticket.studentName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Roll: {ticket.rollNumber} • {ticket.mobile}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <TicketStatusBadge status={ticket.ticketStatus} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(ticket)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/20 rounded-lg text-xs font-bold transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect & Resolve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-400">
                    No tickets found in this queue filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect & Transition Ticket Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f1d38] border border-white/15 rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3.5 mb-5 border-b border-white/10 pb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Fault Ticket Inspection</h3>
                <span className="font-mono text-xs text-cyan-400">{selectedTicket.ticketId}</span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              {/* Evidence Photograph */}
              <div>
                <span className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2">
                  Damage Photo Evidence:
                </span>
                <div className="rounded-2xl overflow-hidden border border-white/15 bg-black/50 aspect-video flex items-center justify-center">
                  {selectedTicket.photoUrl ? (
                    <img
                      src={selectedTicket.photoUrl}
                      alt="Damaged component evidence"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">No image attached</span>
                  )}
                </div>
              </div>

              {/* Student & Fault Info */}
              <div className="space-y-3.5 text-xs">
                <div className="p-4 rounded-2xl bg-[#081124] border border-white/10 space-y-1.5">
                  <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px] block">
                    Student Details:
                  </span>
                  <p className="text-white font-semibold flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-cyan-400" /> {selectedTicket.studentName} (Roll: {selectedTicket.rollNumber})
                  </p>
                  <p className="text-slate-300 flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedTicket.mobile}
                  </p>
                  <p className="text-slate-400 flex items-center gap-2 text-[11px] pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted:{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="block font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-1.5">
                    Fault Description:
                  </span>
                  <div className="p-3.5 rounded-2xl bg-[#081124] border border-white/10 text-slate-200 leading-relaxed text-xs">
                    {selectedTicket.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Action Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-white/10 pt-5 space-y-4">
              <h4 className="font-bold text-xs text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Update Ticket Status & Equipment Lifecycle
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Transition Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="Open" className="bg-slate-900 text-white">Open / Pending</option>
                  <option value="Under Review" className="bg-slate-900 text-white">Under Review</option>
                  <option value="In Repair" className="bg-slate-900 text-white">In Repair (Sets equipment to Under Repair)</option>
                  <option value="Resolved" className="bg-slate-900 text-white">Resolved (Closes fault ticket)</option>
                  <option value="Expired" className="bg-slate-900 text-white">Expired</option>
                </select>
              </div>

              {newStatus === 'Resolved' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Resolution Notes / Work Done
                    </label>
                    <textarea
                      rows="2"
                      required
                      placeholder="e.g. Replaced damaged fuse on channel 1, tested with 1kHz calibration wave, equipment ready."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                    ></textarea>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-3 rounded-xl bg-white/[0.03] border border-white/10">
                    <input
                      type="checkbox"
                      checked={restoreOperational}
                      onChange={(e) => setRestoreOperational(e.target.checked)}
                      className="w-4 h-4 rounded border-white/20 text-cyan-500 focus:ring-0 bg-[#081124]"
                    />
                    <span>
                      Restore equipment operational status to <strong>'Ready to Use'</strong> (if no other open tickets exist)
                    </span>
                  </label>
                </>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
                >
                  {updating ? 'Updating & Notifying Student...' : 'Save & Send Status Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketQueue;

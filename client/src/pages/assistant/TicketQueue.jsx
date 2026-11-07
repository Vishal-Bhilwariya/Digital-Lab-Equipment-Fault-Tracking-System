import React, { useState, useEffect } from 'react';
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
  AlertCircle
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
      setTickets(res.data.data);
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
      setSuccessMsg(`Ticket ${selectedTicket.ticketId} updated to '${newStatus}'`);
      fetchTickets();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update ticket status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Damaged Equipment & Tickets Queue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Student fault reports with photographic evidence. Workflow: Open ➔ Under Review ➔ In Repair ➔ Resolved.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-auto">
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Faults
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All History
          </button>
          <button
            onClick={() => setFilter('Resolved')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              filter === 'Resolved' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Resolved Only
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3">Ticket ID</th>
                <th className="px-5 py-3">Equipment</th>
                <th className="px-5 py-3">Student Reporter</th>
                <th className="px-5 py-3">Reported Fault</th>
                <th className="px-5 py-3">Raised On</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.length > 0 ? (
                tickets.map((tkt) => (
                  <tr key={tkt._id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3 font-mono font-bold text-blue-600">{tkt.ticketId}</td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-900 block">{tkt.equipmentId?.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {tkt.equipmentId?.location}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-800 block">{tkt.studentName}</span>
                      <span className="font-mono text-[11px] text-slate-500">Roll: {tkt.rollNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 max-w-xs truncate">{tkt.description}</td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(tkt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <TicketStatusBadge status={tkt.ticketStatus} />
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDetail(tkt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect & Resolve
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No tickets found in this queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & Action Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="font-mono font-bold text-xs text-blue-600 block">
                  {selectedTicket.ticketId}
                </span>
                <h3 className="font-bold text-lg text-slate-900 mt-0.5">
                  {selectedTicket.equipmentId?.name}
                </h3>
                <p className="text-xs text-slate-500">Location: {selectedTicket.equipmentId?.location}</p>
              </div>
              <TicketStatusBadge status={selectedTicket.ticketStatus} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              {/* Damage Photograph */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Uploaded Damage Photo
                </span>
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-100 h-52 flex items-center justify-center">
                  {selectedTicket.photoUrl ? (
                    <img
                      src={selectedTicket.photoUrl}
                      alt="Damaged instrument evidence"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No photo available</span>
                  )}
                </div>
              </div>

              {/* Student & Fault Info */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-700 block">Student Information:</span>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {selectedTicket.studentName} (Roll: {selectedTicket.rollNumber})
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {selectedTicket.mobile}
                  </p>
                  <p className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Submitted:{' '}
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="block font-semibold text-slate-700 mb-1">Fault Description:</span>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 leading-relaxed">
                    {selectedTicket.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Action Form */}
            <form onSubmit={handleUpdateStatus} className="border-t border-slate-200 pt-4 space-y-3.5">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                Update Ticket & Equipment Lifecycle
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Transition Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="Under Review">Under Review</option>
                  <option value="In Repair">In Repair (Sets equipment to Under Repair)</option>
                  <option value="Resolved">Resolved (Closes fault ticket)</option>
                </select>
              </div>

              {newStatus === 'Resolved' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Resolution Notes / Work Done
                    </label>
                    <textarea
                      rows="2"
                      required
                      placeholder="e.g. Replaced blown fuse on channel 1, calibrated baseline, tested with 1kHz square wave."
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    ></textarea>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={restoreOperational}
                      onChange={(e) => setRestoreOperational(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Restore equipment operational status to <strong>'Ready to Use'</strong> (if no other faults exist)
                    </span>
                  </label>
                </>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Update Ticket'}
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

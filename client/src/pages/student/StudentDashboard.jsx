import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  ClipboardList,
  Clock3,
  Wrench,
  CheckCircle2,
  AlertOctagon,
  Search,
  ExternalLink,
  QrCode,
  Sparkles,
  Loader2,
  FileQuestion,
  Layers,
  LayoutDashboard
} from 'lucide-react';
import { TicketStatusBadge } from '../../utils/statusBadges';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underRepair: 0,
    resolved: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  const fetchStudentTickets = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const res = await api.get('/tickets/my-tickets');
      setTickets(res.data.data || []);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load student tickets:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentTickets();

    // Live auto-refresh every 5 seconds (Instant data fetch)
    const interval = setInterval(fetchStudentTickets, 5000);
    const onFocus = () => fetchStudentTickets();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Filter tickets by search and status
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      t.equipmentId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.labId?.labName?.toLowerCase().includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'PENDING') return matchesSearch && t.ticketStatus === 'Open';
    if (statusFilter === 'IN_REPAIR')
      return matchesSearch && (t.ticketStatus === 'Under Review' || t.ticketStatus === 'In Repair');
    if (statusFilter === 'RESOLVED') return matchesSearch && t.ticketStatus === 'Resolved';
    if (statusFilter === 'EXPIRED') return matchesSearch && t.ticketStatus === 'Expired';
    return matchesSearch;
  });

  return (
    <div className="p-5 sm:p-8 max-w-7xl mx-auto w-full space-y-7 selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Top Banner with Student Info & Go to Main Dashboard */}
      <div className="relative rounded-3xl p-7 border border-white/10 bg-gradient-to-r from-[#171338]/90 via-[#101938]/90 to-[#0b1428]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-400/20 text-violet-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-violet-400" />
            STUDENT PORTAL
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.name || 'Student'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-mono">
            Roll Number: <span className="text-cyan-400 font-bold">{user?.rollNumber || 'N/A'}</span> • Registered: {user?.email}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/student"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-semibold border border-white/10 transition"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            Go to Main Dashboard
          </Link>
          <button
            onClick={() => fetchStudentTickets(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-violet-500/20 transition cursor-pointer"
          >
            {refreshing ? 'Syncing...' : 'Refresh Live'}
          </button>
        </div>
      </div>

      {/* 5 Stats Cards Required by Requirement 5.D */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Tickets */}
        <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Tickets
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-white">{stats.total}</div>
          <span className="text-[10px] text-slate-500">Submitted reports</span>
        </div>

        {/* Pending Tickets */}
        <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Clock3 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-400">{stats.pending}</div>
          <span className="text-[10px] text-slate-500">Awaiting review</span>
        </div>

        {/* Under Repair / In Progress */}
        <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Under Repair
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-400">{stats.underRepair}</div>
          <span className="text-[10px] text-slate-500">Active maintenance</span>
        </div>

        {/* Resolved */}
        <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Resolved
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-400">{stats.resolved}</div>
          <span className="text-[10px] text-slate-500">Fixed & verified</span>
        </div>

        {/* Expired */}
        <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Expired
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-500/10 text-slate-400 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-300">{stats.expired}</div>
          <span className="text-[10px] text-slate-500">Closed or archived</span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl p-4 border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by ticket ID, equipment, or lab name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#081124] border border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'ALL', label: 'All Tickets' },
            { id: 'PENDING', label: 'Pending' },
            { id: 'IN_REPAIR', label: 'Under Repair' },
            { id: 'RESOLVED', label: 'Resolved' },
            { id: 'EXPIRED', label: 'Expired' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="rounded-3xl border border-white/10 bg-[#0d182e]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
            <span className="text-xs">Loading your tickets...</span>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.03] text-slate-400 font-bold border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Equipment & Lab</th>
                  <th className="px-6 py-4">Fault Description</th>
                  <th className="px-6 py-4">Damage Photo</th>
                  <th className="px-6 py-4">Submitted Date</th>
                  <th className="px-6 py-4">Current Status</th>
                  <th className="px-6 py-4">Resolution Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Ticket ID */}
                    <td className="px-6 py-4 font-mono font-bold text-violet-300">
                      {t.ticketId}
                    </td>

                    {/* Equipment & Lab */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-white text-sm block">
                        {t.equipmentId?.name || 'Equipment item'}
                      </span>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        {t.labId?.labName || 'Laboratory'} • {t.labId?.labBlock || ''}
                      </span>
                    </td>

                    {/* Fault Description */}
                    <td className="px-6 py-4 max-w-xs text-slate-300 leading-relaxed">
                      {t.description}
                    </td>

                    {/* Photo Thumbnail */}
                    <td className="px-6 py-4">
                      {t.photoUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPhoto(t.photoUrl)}
                          className="w-12 h-12 rounded-xl overflow-hidden border border-white/15 hover:border-violet-400 transition cursor-pointer relative group shrink-0"
                        >
                          <img
                            src={t.photoUrl}
                            alt="Damage report"
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-200"
                          />
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">No photo</span>
                      )}
                    </td>

                    {/* Creation Date */}
                    <td className="px-6 py-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Current Status */}
                    <td className="px-6 py-4">
                      <TicketStatusBadge status={t.ticketStatus} />
                    </td>

                    {/* Resolution Details */}
                    <td className="px-6 py-4 max-w-xs text-xs">
                      {t.ticketStatus === 'Resolved' ? (
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-semibold block">
                            {t.resolutionNotes || 'Repaired & verified.'}
                          </span>
                          {t.resolvedAt && (
                            <span className="text-[10px] text-slate-500 font-mono block">
                              Resolved: {new Date(t.resolvedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">In progress...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <FileQuestion className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-white">No Fault Tickets Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || statusFilter !== 'ALL'
                ? 'No tickets match your search criteria. Try resetting filters.'
                : 'You have not reported any equipment faults yet. Use your smartphone to scan the QR code on any malfunctioning lab instrument to file a report.'}
            </p>
          </div>
        )}
      </div>

      {/* Helpful Hint Card */}
      <div className="rounded-2xl p-5 border border-violet-500/20 bg-violet-500/[0.05] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <QrCode className="w-8 h-8 text-violet-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-white">Need to report another issue?</h4>
            <p className="text-xs text-slate-400">
              Point your camera at the QR sticker placed on the laboratory equipment to instantly open its reporting page.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Preview Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black">
            <img src={selectedPhoto} alt="Damage report preview" className="w-full h-full object-contain" />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;

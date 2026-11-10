import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Search,
  CheckCircle2,
  Clock,
  Wrench,
  AlertOctagon,
  ArrowLeft,
  Building2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { TicketStatusBadge } from '../../utils/statusBadges';

const TrackTicketPage = () => {
  const [searchParams] = useSearchParams();
  const initialTicketId = searchParams.get('ticketId') || '';
  const initialRollNumber = searchParams.get('rollNumber') || '';

  const [ticketId, setTicketId] = useState(initialTicketId);
  const [rollNumber, setRollNumber] = useState(initialRollNumber);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTrackData = async (tId, rNum) => {
    if (!tId || !rNum) return;
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/tickets/track?ticketId=${tId.trim()}&rollNumber=${rNum.trim()}`);
      setTicketData(res.data.data);
    } catch (err) {
      setTicketData(null);
      setError(err.response?.data?.message || 'No ticket found with this combination.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketId && initialRollNumber) {
      fetchTrackData(initialTicketId, initialRollNumber);
    }
  }, [initialTicketId, initialRollNumber]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTrackData(ticketId, rollNumber);
  };

  return (
    <div className="min-h-screen bg-[#080F20] text-white py-10 px-4 flex flex-col justify-between relative selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-1/4 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-md mx-auto w-full relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-cyan-300 mb-5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Tracking Input Card */}
        <div className="bg-[#0f1d38]/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4 mb-6">
          <div className="flex items-center gap-3.5 border-b border-white/10 pb-4">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-400/25 text-cyan-400 flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Track Fault Ticket Status</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your Ticket ID and Student Roll Number</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Ticket ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TKT-20261107-A9B2"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Student Roll Number
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 2315001383"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                className="w-full bg-[#081124] border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {loading ? 'Searching Ticket...' : 'Search Ticket Status'}
            </button>
          </form>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Ticket Details Result Card */}
        {ticketData && (
          <div className="bg-[#0f1d38]/90 border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase tracking-wider">
                  TICKET REFERENCE
                </span>
                <span className="font-mono text-base font-bold text-cyan-400">
                  {ticketData.ticketId}
                </span>
              </div>
              <TicketStatusBadge status={ticketData.ticketStatus} />
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                  Reported Instrument:
                </span>
                <p className="font-bold text-white text-base mt-0.5">{ticketData.equipmentName}</p>
                <span className="text-slate-400 text-xs font-mono">
                  {ticketData.labName} ({ticketData.labBlock})
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">
                  Problem Description:
                </span>
                <p className="p-3.5 bg-[#081124] rounded-2xl border border-white/10 text-slate-200 mt-1 leading-relaxed">
                  {ticketData.faultDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-xs pt-1 font-mono">
                <span>Submitted On:</span>
                <span className="font-medium text-white">
                  {new Date(ticketData.createdAt).toLocaleString()}
                </span>
              </div>

              {ticketData.ticketStatus === 'Resolved' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Fault Resolved
                  </div>
                  <p className="text-emerald-200/90 text-xs leading-relaxed">
                    {ticketData.resolutionNotes || 'Technician completed the repair and verified equipment functionality.'}
                  </p>
                  {ticketData.resolvedAt && (
                    <span className="text-[11px] text-emerald-400 block font-mono">
                      Closed on: {new Date(ticketData.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-500 py-4 mt-8 relative z-10">
        Local Lab Equipment Calibration & Fault Tracking System • Group G137
      </footer>
    </div>
  );
};

export default TrackTicketPage;

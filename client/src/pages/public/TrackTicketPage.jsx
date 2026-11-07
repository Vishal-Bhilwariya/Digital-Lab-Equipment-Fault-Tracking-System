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
    <div className="min-h-screen bg-slate-100 py-8 px-4 flex flex-col justify-between">
      <div className="max-w-md mx-auto w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-4 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Tracking Input Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4 mb-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Track Fault Ticket Status</h2>
              <p className="text-xs text-slate-500">Enter your Ticket ID and Student Roll Number</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ticket ID</label>
              <input
                type="text"
                required
                placeholder="e.g. TKT-20261107-101"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student Roll Number</label>
              <input
                type="text"
                required
                placeholder="e.g. 2315001383"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Searching Ticket...' : 'Search Ticket Status'}
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Ticket Details Result Card */}
        {ticketData && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-slate-400 block font-mono">TICKET STATUS</span>
                <span className="font-mono text-sm font-bold text-blue-600">
                  {ticketData.ticketId}
                </span>
              </div>
              <TicketStatusBadge status={ticketData.ticketStatus} />
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Reported Instrument:</span>
                <p className="font-bold text-slate-900 text-sm">{ticketData.equipmentName}</p>
                <span className="text-slate-500 text-[11px]">
                  {ticketData.labName} ({ticketData.labBlock})
                </span>
              </div>

              <div>
                <span className="text-slate-400 text-[11px] block">Problem Description:</span>
                <p className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-700 mt-1">
                  {ticketData.faultDescription}
                </p>
              </div>

              <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                <span>Submitted On:</span>
                <span className="font-medium text-slate-700">
                  {new Date(ticketData.createdAt).toLocaleString()}
                </span>
              </div>

              {ticketData.ticketStatus === 'Resolved' && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Fault Resolved
                  </div>
                  <p className="text-emerald-900 text-[11px]">
                    {ticketData.resolutionNotes || 'Technician completed the repair and verified equipment functionality.'}
                  </p>
                  {ticketData.resolvedAt && (
                    <span className="text-[10px] text-emerald-700 block">
                      Closed on: {new Date(ticketData.resolvedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-[11px] text-slate-400 py-4 mt-8">
        Local Lab Equipment Calibration & Fault Tracking System
      </footer>
    </div>
  );
};

export default TrackTicketPage;

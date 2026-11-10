import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Clock, Wrench } from 'lucide-react';

/**
 * Operational Status Badge
 * Values: 'Ready to Use' | 'Under Repair' | 'Damaged'
 */
export const OperationalStatusBadge = ({ status }) => {
  switch (status) {
    case 'Ready to Use':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ready to Use
        </span>
      );
    case 'Under Repair':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Wrench className="w-3.5 h-3.5" />
          Under Repair
        </span>
      );
    case 'Damaged':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Damaged
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
          {status || 'Unknown'}
        </span>
      );
  }
};

/**
 * Calibration Status Badge
 * Values: 'Valid' | 'Due Soon' | 'Overdue'
 */
export const CalibrationStatusBadge = ({ status, daysRemaining }) => {
  let displayDays = daysRemaining !== undefined ? ` (${daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d left`})` : '';

  switch (status) {
    case 'Valid':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Valid{displayDays}
        </span>
      );
    case 'Due Soon':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Clock className="w-3.5 h-3.5" />
          Due Soon{displayDays}
        </span>
      );
    case 'Overdue':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Overdue{displayDays}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
          {status || 'Not Set'}
        </span>
      );
  }
};

/**
 * Ticket Status Badge
 * Values: 'Open' | 'Under Review' | 'In Repair' | 'Resolved'
 */
export const TicketStatusBadge = ({ status }) => {
  switch (status) {
    case 'Open':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
          <AlertCircle className="w-3.5 h-3.5" />
          Open
        </span>
      );
    case 'Under Review':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
          <Clock className="w-3.5 h-3.5" />
          Under Review
        </span>
      );
    case 'In Repair':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <Wrench className="w-3.5 h-3.5" />
          In Repair
        </span>
      );
    case 'Resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolved
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
          {status || 'Unknown'}
        </span>
      );
  }
};

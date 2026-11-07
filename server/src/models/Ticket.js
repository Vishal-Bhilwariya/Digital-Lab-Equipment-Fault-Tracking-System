import mongoose from 'mongoose';
import { generateTicketId, TICKET_STATUS } from '../utils/constants.js';

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
      default: generateTicketId
    },
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment reference is required'],
      index: true
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab reference is required'],
      index: true
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    rollNumber: {
      type: String,
      required: [true, 'Student roll number is required'],
      uppercase: true,
      trim: true
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Fault description is required'],
      trim: true
    },
    photoUrl: {
      type: String,
      required: [true, 'Photo of damaged equipment is required']
    },
    ticketStatus: {
      type: String,
      enum: Object.values(TICKET_STATUS),
      default: TICKET_STATUS.OPEN,
      index: true
    },
    resolutionNotes: {
      type: String,
      trim: true
    },
    resolvedAt: {
      type: Date
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;

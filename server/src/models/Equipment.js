import mongoose from 'mongoose';
import { generatePublicId, OPERATIONAL_STATUS } from '../utils/constants.js';

const equipmentSchema = new mongoose.Schema(
  {
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      default: generatePublicId
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lab',
      required: [true, 'Lab reference is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Serial number is required'],
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Physical location/bench is required'],
      trim: true
    },
    installationDate: {
      type: Date,
      default: Date.now
    },
    operationalStatus: {
      type: String,
      enum: Object.values(OPERATIONAL_STATUS),
      default: OPERATIONAL_STATUS.READY_TO_USE
    },
    // Damage count: Incremented on valid fault ticket, NEVER resets or decreases
    damageCount: {
      type: Number,
      default: 0,
      min: 0
    },
    calibrationIntervalDays: {
      type: Number,
      default: 180,
      min: 1
    },
    lastCalibrationDate: {
      type: Date,
      default: Date.now
    },
    nextCalibrationDate: {
      type: Date,
      required: [true, 'Next calibration due date is required'],
      index: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for dynamic calibration health status
equipmentSchema.virtual('calibrationHealth').get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(this.nextCalibrationDate);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { status: 'Overdue', daysRemaining: diffDays };
  if (diffDays <= 15) return { status: 'Due Soon', daysRemaining: diffDays };
  return { status: 'Valid', daysRemaining: diffDays };
});

equipmentSchema.set('toJSON', { virtuals: true });
equipmentSchema.set('toObject', { virtuals: true });

const Equipment = mongoose.model('Equipment', equipmentSchema);
export default Equipment;

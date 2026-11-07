import mongoose from 'mongoose';

const calibrationLogSchema = new mongoose.Schema(
  {
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
    calibratedBy: {
      type: String,
      required: [true, 'Technician / Agency name is required'],
      trim: true
    },
    calibrationDate: {
      type: Date,
      required: [true, 'Calibration date is required']
    },
    nextDueDate: {
      type: Date,
      required: [true, 'Next calibration due date is required']
    },
    certificateUrl: {
      type: String,
      trim: true
    },
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Immutable historical records
  }
);

const CalibrationLog = mongoose.model('CalibrationLog', calibrationLogSchema);
export default CalibrationLog;

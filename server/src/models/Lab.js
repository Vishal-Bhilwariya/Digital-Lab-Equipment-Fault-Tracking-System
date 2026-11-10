import mongoose from 'mongoose';
import { generateLabId } from '../utils/constants.js';

const labSchema = new mongoose.Schema(
  {
    labId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      default: generateLabId
    },
    labName: {
      type: String,
      required: [true, 'Lab name is required'],
      trim: true
    },
    labBlock: {
      type: String,
      required: [true, 'Lab block is required'],
      trim: true
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

const Lab = mongoose.model('Lab', labSchema);
export default Lab;

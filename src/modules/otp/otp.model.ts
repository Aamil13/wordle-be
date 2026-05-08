import mongoose, { Schema } from 'mongoose';
import { IOtp } from './otp.interface';

const OtpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    select: false, // never returned in queries by default
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// TTL index — MongoDB auto-deletes document when expiresAt is reached
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// One OTP per email at a time
OtpSchema.index({ email: 1 }, { unique: true });

const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);

export default OtpModel;

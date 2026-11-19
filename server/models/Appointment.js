import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
    },

    date: {
      type: Date,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      enum: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00'],
    },

    meetingType: {
      type: String,
      enum: ['In Person', 'Online'],
      default: 'In Person',
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled'],
      default: 'Pending',
    },

    adminNote: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;

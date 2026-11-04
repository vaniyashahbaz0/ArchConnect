import mongoose from 'mongoose';

const consultationSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    projectType: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    budget: {
      type: Number,
    },

    attachments: [String],

    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

const Consultation = mongoose.model('Consultation', consultationSchema);

export default Consultation;

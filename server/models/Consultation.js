import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
    },

    filename: {
      type: String,
    },

    mimeType: {
      type: String,
    },

    size: {
      type: Number,
    },
  },
  { _id: false }
);

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
      enum: ['Residential', 'Commercial', 'Interior', 'Landscape', 'Renovation', 'Other'],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    budget: {
      type: Number,
    },

    location: {
      type: String,
      trim: true,
    },

    preferredStartDate: {
      type: Date,
    },

    attachments: [attachmentSchema],

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

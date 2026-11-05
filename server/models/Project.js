import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
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

    category: {
      type: String,
      required: true,
      enum: ['Residential', 'Commercial', 'Interior', 'Landscape', 'Other'],
    },

    status: {
      type: String,
      enum: ['completed', 'ongoing'],
      default: 'ongoing',
    },

    location: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
    },

    images: [String],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;

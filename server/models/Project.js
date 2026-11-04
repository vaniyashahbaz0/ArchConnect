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
    },

    category: {
      type: String,
    },

    status: {
      type: String,
      enum: ['completed', 'ongoing'],
      default: 'ongoing',
    },

    images: [String],
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', projectSchema);

export default Project;

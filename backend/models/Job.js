const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    profileSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    profileUpdatedAt: { type: Date, default: null },
    snapshotCapturedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'withdrawn', 'rejected'],
      default: 'active'
    },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const jobSchema = new mongoose.Schema({
  // NEW: Specify the institution (university/college) posting the job
  institution: { type: String, required: true },

  // Job title comes next
  title: { type: String, required: true },

  // Followed by department, type, location, etc.
  department: { type: String, required: true },
  type: { type: String, required: true, enum: ["Full-time", "Part-time", "Contract", "Internship"] },
  location: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  skills: { type: [String], required: true },
  reapplyCooldownMonths: { type: Number, default: 0 },

  // Link to the HR user who posted the job
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Track applications with status and timestamps
  applications: {
    type: [applicationSchema],
    default: []
  }
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

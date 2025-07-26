const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // 
    ref: 'User', // Reference the User model
    required: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  skills: [String],
  summary: { type: String },
  experience: [{
    title: String,
    institution: String,
    start: String,
    end: String,
    current: { type: Boolean, default: false },
    description: String
  }],
  education: [{
    degree: String,
    institution: String,
    year: String,
    field: String
  }],
  publications: [{
    title: String,
    description: String,
    link: String,
  }],
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
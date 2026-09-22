const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // 
    ref: 'User', // Reference the User model
    required: true
  },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  title: { type: String, default: "" },
  location: { type: String, default: "" },
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
  languages: [{
    name: String,
    proficiency: String,
  }],
  certifications: [{
    title: String,
    issuer: String,
    year: String,
    link: String,
  }],
  projects: [{
    title: String,
    description: String,
    link: String,
    start: String,
    end: String,
    current: { type: Boolean, default: false },
  }],
  awards: [{
    title: String,
    issuer: String,
    year: String,
    link: String,
  }],
  patents: [{
    title: String,
    patentNumber: String,
    status: String,
    link: String,
    description: String,
  }],
  enabledSections: { type: [String], default: [] },
  profileImage: {
    url: String,
    key: String,
    filename: String,
    size: Number,
    contentType: String,
  },
  resumeFile: {
    url: String,
    key: String,
    filename: String,
    size: Number,
    contentType: String,
    data: Buffer,
  }
}, { timestamps: true });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
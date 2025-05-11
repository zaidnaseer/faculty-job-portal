const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // NEW: Specify the institution (university/college) posting the job
  institution: { type: String, required: true },
  
  // Job title comes next
  title: { type: String, required: true },
  
  // Followed by department, type, location, etc.
  department: { type: String, required: true },
  type: { type: String, required: true, enum: ["Full-time", "Part-time", "Contract","Internship"] },
  location: { type: String, required: true },
  postedDate: { type: Date, default: Date.now },
  description: { type: String, required: true },
  skills: { type: [String], required: true },
  featured: { type: Boolean, default: false },
  
  // Link to the HR user who posted the job
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Link to faculty users who applied to this job
  appliedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;

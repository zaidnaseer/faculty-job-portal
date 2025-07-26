const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { requireAuth, protect } = require("../middleware/authMiddleware");


router.get('/my-applications', protect(["faculty"]), async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming the user is stored in req.user after authentication

    // Fetch jobs where the current user is in the 'appliedBy' array
    const appliedJobs = await Job.find({ appliedBy: userId }).populate('postedBy', 'name email');

    // Return the applied jobs  
    res.json(appliedJobs);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/my-jobs", protect(['hr']), async (req, res) => {
  console.log("Fetching HR jobs for user:");
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).populate("appliedBy", "name email"); // Populate faculty details
    console.log(Array.isArray(jobs));
    res.json(jobs);
    console.log(jobs);
  } catch (error) {
    console.error("Error fetching HR jobs:", error);
    res.status(500).json({ message: "Server error " });
  }
});

// ✅ Get all jobs
router.get("/", async (req, res) => {
  
  try {
    const jobs = await Job.find().populate("postedBy", "name email").populate("appliedBy", "name email");
    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// ✅ Get a specific job by ID
router.get("/JOBS/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("postedBy", "name email")
      .populate("appliedBy", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Get applicants for a specific job (for HR dashboard)
router.get("/:jobId/applicants", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate("appliedBy", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ applicants: job.appliedBy, jobTitle: job.title });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a new job (by HR)
router.post("/", protect(["hr"]), async (req, res) => {
  try {
    const { title, department, type, location, description, skills, featured } = req.body;

    const newJob = new Job({
      institution: req.user.university, 
      title,
      department,
      type,
      location,
      description,
      skills,
      featured,
      postedBy: req.user._id, // Logged-in HR ID from JWT
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// ✅ Apply for a job (by Faculty)
router.post("/apply/:id", protect(["faculty"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (!job.appliedBy.includes(req.user._id)) {
      job.appliedBy.push(req.user._id);
      await job.save();
      return res.status(200).json({ message: "Successfully applied for the job" });
    } else {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to apply for job" });
  }
});

// ✅ Delete a job (by HR)
router.delete("/:id", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this job" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});



module.exports = router;

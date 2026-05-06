const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Profile = require("../models/Profile");
const { requireAuth, protect } = require("../middleware/authMiddleware");


router.get('/my-applications', protect(["faculty"]), async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming the user is stored in req.user after authentication

    // Fetch jobs where the current user has an application
    const appliedJobs = await Job.find({ "applications.user": userId })
      .populate('postedBy', 'name email')
      .lean();

    const jobsWithStatus = appliedJobs.map((job) => {
      const application = job.applications.find(
        (entry) => entry.user.toString() === userId.toString()
      );

      return {
        ...job,
        applicationStatus: application?.status || "active",
        applicationUpdatedAt: application?.updatedAt || application?.appliedAt || null
      };
    });

    // Return the applied jobs  
    res.json(jobsWithStatus);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/my-jobs", protect(['hr']), async (req, res) => {
  console.log("Fetching HR jobs for user:");
  try {
    const jobs = await Job.find({ postedBy: req.user._id }).populate("applications.user", "name email"); // Populate faculty details
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
    const jobs = await Job.find().populate("postedBy", "name email").populate("applications.user", "name email");
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
      .populate("applications.user", "name email");

    if (!job) return res.status(404).json({ message: "Job not found" });

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Get applicants for a specific job (for HR dashboard)
router.get("/:jobId/applicants", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId).populate("applications.user", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });

    const applicants = job.applications
      .filter((entry) => entry.status === "active")
      .map((entry) => entry.user);

    res.json({ applicants, jobTitle: job.title });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create a new job (by HR)
router.post("/", protect(["hr"]), async (req, res) => {
  try {
    const { title, department, type, location, description, skills } = req.body;

    const newJob = new Job({
      institution: req.user.university,
      title,
      department,
      type,
      location,
      description,
      skills,
      postedBy: req.user._id, // Logged-in HR ID from JWT
    });

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// ✅ Reject an applicant for a job (by HR)
router.patch("/:jobId/applicants/:applicantId/reject", protect(["hr"]), async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: "Job not found" });

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    const application = job.applications.find(
      (entry) => entry.user.toString() === applicantId.toString()
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "rejected") {
      return res.status(400).json({ message: "Application already rejected" });
    }

    if (application.status === "withdrawn") {
      return res.status(400).json({ message: "Cannot reject a withdrawn application" });
    }

    application.status = "rejected";
    application.updatedAt = new Date();
    await job.save();

    return res.status(200).json({ message: "Application rejected" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject application" });
  }
});

// ✅ Apply for a job (by Faculty)
router.post("/apply/:id", protect(["faculty"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    const existingApplication = job.applications.find(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      if (existingApplication.status === "active") {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      if (existingApplication.status === "rejected") {
        return res.status(400).json({ message: "You were not selected for this role" });
      }

      existingApplication.status = "active";
      existingApplication.updatedAt = new Date();
      existingApplication.appliedAt = new Date();
      await job.save();
      return res.status(200).json({ message: "Successfully applied for the job" });
    }

    job.applications.push({
      user: req.user._id,
      status: "active",
      appliedAt: new Date(),
      updatedAt: new Date()
    });
    await job.save();
    return res.status(200).json({ message: "Successfully applied for the job" });
  } catch (error) {
    res.status(500).json({ error: "Failed to apply for job" });
  }
});

// ✅ Withdraw an application (by Faculty)
router.delete("/withdraw/:id", protect(["faculty"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });

    const application = job.applications.find(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === "withdrawn") {
      return res.status(400).json({ message: "Application already withdrawn" });
    }

    if (application.status === "rejected") {
      return res.status(400).json({ message: "Cannot withdraw a rejected application" });
    }

    application.status = "withdrawn";
    application.updatedAt = new Date();
    await job.save();

    return res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to withdraw application" });
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

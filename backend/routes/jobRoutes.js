const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const Profile = require("../models/Profile");
const { getPrivateResumeUrl, copyResumeForApplication } = require("../utils/r2");
const { requireAuth, protect } = require("../middleware/authMiddleware");

const buildProfileSnapshot = (profile) => ({
  _id: profile?._id,
  name: profile?.name || "",
  title: profile?.title || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  location: profile?.location || "",
  skills: Array.isArray(profile?.skills) ? profile.skills : [],
  summary: profile?.summary || "",
  experience: Array.isArray(profile?.experience) ? profile.experience : [],
  education: Array.isArray(profile?.education) ? profile.education : [],
  publications: Array.isArray(profile?.publications) ? profile.publications : [],
  profileImage: profile?.profileImage || "",
  resumeFile: profile?.resumeFile?.key ? {
    key: profile.resumeFile.key,
    filename: profile.resumeFile.filename || "resume.pdf",
    size: profile.resumeFile.size,
    contentType: profile.resumeFile.contentType,
  } : null,
});

const addMonths = (date, months) => {
  const base = new Date(date);
  const result = new Date(base);
  result.setMonth(result.getMonth() + months);
  return result;
};

const APPLICATION_RETENTION_MONTHS = 12;

const hasCompletePosting = (job) => (
  job.title?.trim() &&
  job.department?.trim() &&
  job.type &&
  job.location?.trim() &&
  job.description?.trim() &&
  Array.isArray(job.skills) &&
  job.skills.length > 0
);

const getRetentionCutoff = () => addMonths(new Date(), -APPLICATION_RETENTION_MONTHS);

const purgeExpiredApplications = async (job) => {
  const cutoff = getRetentionCutoff();
  const originalCount = job.applications.length;

  job.applications = job.applications.filter((entry) => {
    if (!entry) return false;

    if (entry.status === "rejected" || entry.status === "withdrawn") {
      const lastUpdated = entry.updatedAt || entry.appliedAt || new Date(0);
      return lastUpdated >= cutoff;
    }

    return true;
  });

  if (job.applications.length !== originalCount) {
    await job.save();
  }

  return job;
};

router.get('/my-applications', protect(["faculty"]), async (req, res) => {
  try {
    const userId = req.user.id;  // Assuming the user is stored in req.user after authentication

    // Fetch jobs where the current user has an application
    const appliedJobs = await Job.find({ "applications.user": userId })
      .populate('postedBy', 'name email');

    const jobsWithStatus = [];

    for (const job of appliedJobs) {
      await purgeExpiredApplications(job);

      const application = job.applications.find(
        (entry) => entry.user.toString() === userId.toString()
      );

      if (!application) {
        continue;
      }

      const cooldownMonths = Number(job.reapplyCooldownMonths) || 0;
      const baseDate = application?.updatedAt || application?.appliedAt || null;
      const reapplyEligibleAt =
        baseDate && cooldownMonths > 0 ? addMonths(baseDate, cooldownMonths) : null;

      const jobData = job.toObject();
      jobsWithStatus.push({
        ...jobData,
        applicationStatus: application?.status || "active",
        applicationUpdatedAt: baseDate,
        reapplyEligibleAt
      });
    }

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
    for (const job of jobs) {
      await purgeExpiredApplications(job);
    }
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
    const jobs = await Job.find({ $or: [{ status: "Active" }, { status: { $exists: false } }] }).populate("postedBy", "name email").populate("applications.user", "name email");
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

    if (!job || (job.status && job.status !== "Active")) {
      return res.status(404).json({ message: "Job not found" });
    }

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
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this application list" });
    }

    await purgeExpiredApplications(job);

    const applicantsByStatus = {
      active: [],
      rejected: [],
      withdrawn: []
    };

    job.applications.forEach((entry) => {
      if (!entry?.user) return;

      if (entry.status === "active") {
        applicantsByStatus.active.push(entry.user);
        return;
      }

      if (entry.status === "rejected") {
        applicantsByStatus.rejected.push(entry.user);
        return;
      }

      if (entry.status === "withdrawn") {
        applicantsByStatus.withdrawn.push(entry.user);
      }
    });

    res.json({
      applicantsByStatus,
      jobTitle: job.title,
      retentionMonths: APPLICATION_RETENTION_MONTHS
    });
  } catch (error) {
    console.error("Error fetching applicants:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:jobId/applicants/:applicantId/snapshot", protect(["hr"]), async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this application" });
    }

    const application = job.applications.find(
      (entry) => entry.user.toString() === applicantId.toString()
    );

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const resumeSnapshot = application.profileSnapshot?.resumeFile;
    const resumeUrl = resumeSnapshot?.key
      ? await getPrivateResumeUrl(resumeSnapshot.key, 300)
      : null;
    const profileSnapshot = application.profileSnapshot
      ? { ...application.profileSnapshot, resumeFile: undefined }
      : null;

    return res.status(200).json({
      profileSnapshot,
      resume: resumeUrl ? {
        url: resumeUrl,
        filename: resumeSnapshot.filename || "resume.pdf",
      } : null,
      profileUpdatedAt: application.profileUpdatedAt || null,
      snapshotCapturedAt: application.snapshotCapturedAt || null,
      appliedAt: application.appliedAt || null,
      updatedAt: application.updatedAt || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch application snapshot" });
  }
});

// ✅ Create a new job (by HR)
router.post("/", protect(["hr"]), async (req, res) => {
  try {
    const { title, department, type, location, description, skills, reapplyCooldownMonths, status } = req.body;

    const requestedStatus = ["Active", "Draft"].includes(status) ? status : "Active";
    const newJob = new Job({
      institution: req.user.university,
      title,
      department,
      type,
      location,
      description,
      skills,
      reapplyCooldownMonths: Number(reapplyCooldownMonths) || 0,
      status: requestedStatus,
      postedBy: req.user._id, // Logged-in HR ID from JWT
    });

    if (requestedStatus === "Active" && !hasCompletePosting(newJob)) {
      return res.status(400).json({ message: "Complete all job details before publishing" });
    }

    await newJob.save();
    res.status(201).json(newJob);
  } catch (error) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

// Update a job posting (by its owner)
router.patch("/:id", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }

    if (!job.status) job.status = "Active";

    const allowedFields = ["title", "department", "type", "location", "description", "skills", "reapplyCooldownMonths", "status"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) job[field] = field === "reapplyCooldownMonths"
        ? Number(req.body[field]) || 0
        : req.body[field];
    });

    if (!["Active", "Draft"].includes(job.status)) {
      return res.status(400).json({ message: "This job cannot be published" });
    }
    if (job.status === "Active" && !hasCompletePosting(job)) {
      return res.status(400).json({ message: "Complete all job details before publishing" });
    }

    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

// Close or reopen a job posting (by its owner)
router.patch("/:id/status", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this job" });
    }
    if (!["Active", "Closed"].includes(req.body.status)) {
      return res.status(400).json({ message: "Status must be Active or Closed" });
    }

    job.status = req.body.status;
    await job.save();
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to update job status" });
  }
});

// Permanently delete a stopped job and its embedded application data.
router.delete("/:id/permanent", protect(["hr"]), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to permanently delete this job" });
    }
    if (job.status !== "Closed" && job.status !== "Deleted") {
      return res.status(400).json({ message: "Only stopped jobs can be permanently deleted" });
    }

    await job.deleteOne();
    res.status(200).json({ message: "Job permanently deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to permanently delete job" });
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

    if (!job || (job.status && job.status !== "Active")) return res.status(404).json({ message: "Job not found" });

    await purgeExpiredApplications(job);

    const profile = await Profile.findOne({ user: req.user._id }).lean();
    if (!profile) {
      return res.status(400).json({ message: "Please create a profile before applying." });
    }

    const profileSnapshot = buildProfileSnapshot(profile);
    if (profileSnapshot.resumeFile?.key) {
      profileSnapshot.resumeFile.key = await copyResumeForApplication(
        profileSnapshot.resumeFile.key,
        req.user._id,
        profileSnapshot.resumeFile.filename
      );
    }
    const profileUpdatedAt = profile.updatedAt || profile.createdAt || new Date();
    const snapshotCapturedAt = new Date();

    const existingApplication = job.applications.find(
      (entry) => entry.user.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      if (existingApplication.status === "active") {
        return res.status(400).json({ message: "You have already applied for this job" });
      }

      if (existingApplication.status === "rejected" || existingApplication.status === "withdrawn") {
        const cooldownMonths = Number(job.reapplyCooldownMonths) || 0;
        const updatedAt = existingApplication.updatedAt || existingApplication.appliedAt || new Date();

        if (cooldownMonths > 0) {
          const eligibleAt = addMonths(updatedAt, cooldownMonths);
          if (new Date() < eligibleAt) {
            return res.status(400).json({
              message: "Reapply cooldown period has not passed for this role",
              eligibleAt
            });
          }
        }
      }

      existingApplication.status = "active";
      existingApplication.updatedAt = new Date();
      existingApplication.appliedAt = new Date();
      existingApplication.profileSnapshot = profileSnapshot;
      existingApplication.profileUpdatedAt = profileUpdatedAt;
      existingApplication.snapshotCapturedAt = snapshotCapturedAt;
      await job.save();
      return res.status(200).json({ message: "Successfully applied for the job" });
    }

    job.applications.push({
      user: req.user._id,
      profileSnapshot,
      profileUpdatedAt,
      snapshotCapturedAt,
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

    job.status = "Deleted";
    await job.save();
    res.status(200).json({ message: "Job deleted successfully", job });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});



module.exports = router;

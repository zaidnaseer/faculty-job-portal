const express = require("express");
const router = express.Router();
const Resume = require("../models/Resume");

// Get resume by faculty user ID

router.get("/:userId", async (req, res) => {
  console.log("Fetching resume for user:", req.params.userId);
  try {
    const resume = await Resume.findOne({ user: req.params.userId });
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    res.json(resume);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

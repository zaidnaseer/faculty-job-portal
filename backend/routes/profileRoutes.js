const express = require("express");
const router = express.Router();
const Profile = require("../models/Profile");

// Get profile by faculty user ID

router.get("/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;

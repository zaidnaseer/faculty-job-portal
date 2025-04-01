const express = require('express');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const { protect, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Get faculty resume (general auth)
router.get('/:id', protect(['faculty']), async (req, res) => {
  try {
    console.log("req.params.id", req.params.id);
    const resume = await Resume.findOne({ user: req.params.id });
    if (!resume) return res.status(404).json({ message: 'Resume not found' });

    res.json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Update faculty resume
router.put('/update/:id', protect(['faculty']), async (req, res) => {

  try {
    console.log("updatedFaculty");
    
      const { id } = req.params;
      const updatedData = req.body;

      // Update the resume in the database
      const updatedFaculty = await Resume.findByIdAndUpdate(
          id,
          updatedData,
          { new: true }
      );
      console.log("updatedFaculty", updatedFaculty);
      if (!updatedFaculty) {
          return res.status(404).json({ message: "Faculty not found" });
      }

      res.status(200).json(updatedFaculty);
  } catch (error) {
      console.error("Failed to update faculty:", error);
      res.status(500).json({ message: "Failed to update faculty" });
  }
});

// ✅ Create new resume (separate route)
router.post('/add', protect(['faculty']), async (req, res) => {
  try {
    const { name, email, phone, skills, summary, experience, education } = req.body;

    // ✅ Check if the user already has a resume
  
    const existingResume = await Resume.findOne({ user: req.user.id });
    if (existingResume) {
      return res.status(400).json({ message: 'Resume already exists' });
    }

    // ✅ Create new resume linked to user
    const newResume = new Resume({
      user: req.user.id, // ✅ Link to user
      name,
      email,
      phone,
      skills,
      summary,
      experience,
      education
    });

    await newResume.save();
    res.status(201).json(newResume);
  } catch (error) {
    console.error('Error creating resume:', error);
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;

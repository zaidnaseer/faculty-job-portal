const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Profile = require('../models/Profile');
const { protect, requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration for file upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept PDF, Word documents, TXT, and RTF files
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/plain', // .txt
    'application/rtf', // .rtf
    'text/rtf' // .rtf (alternative MIME type)
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, Word, TXT, and RTF documents are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

// ✅ Get faculty profile (general auth)
router.get('/:id', async (req, res) => {
  try {
    console.log("req.params.id", req.params.id);
    const profile = await Profile.findOne({ user: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Update faculty profile
router.put('/update/:id', protect(['faculty']), async (req, res) => {

  try {
    console.log("updatedFaculty");
    
      const { id } = req.params;
      const updatedData = req.body;

      // Update the profile in the database
      const updatedFaculty = await Profile.findByIdAndUpdate(
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

// ✅ Create new profile (separate route)
router.post('/add', protect(['faculty']), upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, skills, summary, experience, education, publications } = req.body;

    // ✅ Check if the user already has a profile
  
    const existingProfile = await Profile.findOne({ email: email });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Parse JSON strings back to objects/arrays
    const parsedSkills = skills ? JSON.parse(skills) : [];
    const parsedExperience = experience ? JSON.parse(experience) : [];
    const parsedEducation = education ? JSON.parse(education) : [];
    const parsedPublications = publications ? JSON.parse(publications) : [];

    // ✅ Create new profile linked to user
    const newProfile = new Profile({
      user: req.user.id, // ✅ Link to user
      name,
      email,
      phone,
      skills: parsedSkills,
      summary,
      experience: parsedExperience,
      education: parsedEducation,
      publications: parsedPublications
    });

    // ✅ Add resume file if uploaded
    if (req.file) {
      newProfile.resumeFile = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
        filename: req.file.originalname,
        size: req.file.size
      };
    }

    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    console.error('Error creating profile:', error);
    
    // Handle multer errors
    if (error.message.includes('File too large')) {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: error.message });
  }
});
module.exports = router;

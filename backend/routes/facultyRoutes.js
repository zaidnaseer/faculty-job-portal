const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Profile = require('../models/Profile');
const {
  uploadResumeToR2,
  getPrivateResumeUrl,
  deleteResumeFromR2,
  uploadProfileImageToR2,
  getPrivateProfileImageUrl,
  deleteProfileImageFromR2,
} = require('../utils/r2');
const { validateProfileImage } = require('../utils/profileImageValidation');
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

const profileImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error('Invalid image type. Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  },
});

const profileCreationUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const isResume = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/rtf',
      'text/rtf',
    ].includes(file.mimetype);
    const isProfileImage = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype);

    if (isResume || (file.fieldname === 'profileImage' && isProfileImage)) {
      cb(null, true);
      return;
    }

    cb(new Error('Invalid file type. Only supported resume documents and profile images are allowed.'), false);
  },
});

// ✅ Get faculty profile (general auth)
router.get('/:id', async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile-image/:profileId', protect(['faculty', 'hr']), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile || !profile.profileImage?.key) {
      return res.status(404).json({ message: 'Profile image not found' });
    }

    const isOwner = profile.user.toString() === req.user.id.toString();
    if (!isOwner && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const signedUrl = await getPrivateProfileImageUrl(profile.profileImage.key, 300);
    if (!signedUrl) {
      return res.status(500).json({ message: 'Profile image URL could not be generated' });
    }

    res.json({
      url: signedUrl,
      filename: profile.profileImage.filename || 'profile-image',
      contentType: profile.profileImage.contentType,
    });
  } catch (error) {
    console.error('Error generating signed profile image URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/profile-image/:profileId', protect(['faculty']), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    if (profile.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteProfileImageFromR2(profile.profileImage?.key);
    profile.profileImage = undefined;
    await profile.save();
    res.json({ message: 'Profile image deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile image:', error);
    res.status(500).json({ message: 'Failed to delete profile image' });
  }
});

router.post('/profile-image/:profileId', protect(['faculty']), profileImageUpload.single('profileImage'), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    if (profile.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a profile image to upload.' });
    }

    validateProfileImage(req.file);

    const uploadedImage = await uploadProfileImageToR2(req.file, req.user.id);
    await deleteProfileImageFromR2(profile.profileImage?.key);
    profile.profileImage = uploadedImage;
    await profile.save();
    res.status(201).json(profile);
  } catch (error) {
    console.error('Error uploading profile image:', error);
    res.status(500).json({ message: error.message || 'Failed to upload profile image' });
  }
});


// ✅ Update faculty profile
router.put('/update/:id', protect(['faculty']), async (req, res) => {

  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Update the profile in the database
    const updatedFaculty = await Profile.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );
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
router.get('/resume/:profileId', protect(['faculty', 'hr']), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile || !profile.resumeFile || !profile.resumeFile.key) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const isOwner = profile.user.toString() === req.user.id.toString();
    const isHR = req.user.role === 'hr';

    if (!isOwner && !isHR) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const signedUrl = await getPrivateResumeUrl(profile.resumeFile.key, 300);
    if (!signedUrl) {
      return res.status(500).json({ message: 'Resume URL could not be generated' });
    }

    res.json({ url: signedUrl, filename: profile.resumeFile.filename || 'resume.pdf' });
  } catch (error) {
    console.error('Error generating signed resume URL:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/resume/:profileId', protect(['faculty']), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await deleteResumeFromR2(profile.resumeFile?.key);
    profile.resumeFile = undefined;
    await profile.save();

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

router.post('/resume/:profileId', protect(['faculty']), upload.single('resume'), async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.profileId);
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a resume to upload.' });
    }

    const uploadedResume = await uploadResumeToR2(req.file, req.user.id);
    if (!uploadedResume) {
      return res.status(400).json({ message: 'Cloudflare R2 is not configured. Please add R2 credentials first.' });
    }

    await deleteResumeFromR2(profile.resumeFile?.key);
    profile.resumeFile = {
      url: uploadedResume.url,
      key: uploadedResume.key,
      filename: uploadedResume.filename,
      size: uploadedResume.size,
      contentType: uploadedResume.contentType,
    };
    await profile.save();

    res.status(201).json(profile);
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ message: error.message || 'Failed to upload resume' });
  }
});

router.post('/add', protect(['faculty']), profileCreationUpload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'profileImage', maxCount: 1 },
]), async (req, res) => {
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

    // ✅ Upload resume to Cloudflare R2 and store the object URL
    const resumeFile = req.files?.resume?.[0];
    const profileImageFile = req.files?.profileImage?.[0];

    if (resumeFile) {
      const uploadedResume = await uploadResumeToR2(resumeFile, req.user.id);

      if (!uploadedResume) {
        return res.status(400).json({ message: 'Cloudflare R2 is not configured. Please add R2 credentials first.' });
      }

      newProfile.resumeFile = {
        url: uploadedResume.url,
        key: uploadedResume.key,
        filename: uploadedResume.filename,
        size: uploadedResume.size,
        contentType: uploadedResume.contentType,
      };
    }

    if (profileImageFile) {
      validateProfileImage(profileImageFile);
      const uploadedImage = await uploadProfileImageToR2(profileImageFile, req.user.id);
      newProfile.profileImage = {
        url: uploadedImage.url,
        key: uploadedImage.key,
        filename: uploadedImage.filename,
        size: uploadedImage.size,
        contentType: uploadedImage.contentType,
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

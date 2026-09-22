const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('../utils/firebaseAdmin');
const { isEmailVerificationRequired } = require('../config/featureFlags');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { idToken, name, role, university } = req.body;

  try {
    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }

    if (!['faculty', 'hr'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role === 'hr' && !university) {
      return res.status(400).json({ message: 'University is required for employer accounts' });
    }

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const email = decodedToken.email;
    const firebaseUid = decodedToken.uid;

    if (!email) {
      return res.status(400).json({ message: 'Email not found in Firebase token' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { firebaseUid }],
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Build user object
    const userData = { name, email, role, firebaseUid, isEmailVerified: !!decodedToken.email_verified };
    if (role === 'hr' && university) {
      userData.university = university;
    }

    // Create and save user
    const user = new User(userData);
    await user.save();

    // Generate app JWT token (used by existing protected routes)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30h',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      emailVerificationRequired: isEmailVerificationRequired(),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    const user = await User.findOne({ firebaseUid });

    if (!user) {
      return res.status(404).json({ message: 'No profile found. Please complete registration first.' });
    }

    // Keep our record of verification status in sync with Firebase.
    const isEmailVerified = !!decodedToken.email_verified;
    if (user.isEmailVerified !== isEmailVerified) {
      user.isEmailVerified = isEmailVerified;
      await user.save();
    }

    // Verification is mandatory for HR accounts; faculty can browse unverified
    // and are only blocked when they try to apply for a job.
    if (isEmailVerificationRequired() && user.role === 'hr' && !user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email address before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30h' });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      role: user.role,
      name: user.name,
      id: user._id
    });
  } catch (error) {
    console.error('Error logging in:', error);
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
      return res.status(401).json({ message: 'Invalid or expired Firebase token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ ...user.toObject(), emailVerificationRequired: isEmailVerificationRequired() });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});



module.exports = router;

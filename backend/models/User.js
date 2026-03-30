const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  firebaseUid: { type: String, unique: true, sparse: true },
  role: { type: String, required: true }, // faculty or hr
  university: { type: String }, // ✅ Only applicable for HR users
});

const User = mongoose.model('User', userSchema);

module.exports = User;

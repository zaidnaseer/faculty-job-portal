const mongoose = require('mongoose');

const applicantListVisitSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    visitedAt: { type: Date, required: true }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  firebaseUid: { type: String, unique: true, sparse: true },
  role: { type: String, required: true }, // faculty or hr
  university: { type: String }, // ✅ Only applicable for HR users
  applicantListVisits: { type: [applicantListVisitSchema], default: [] }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

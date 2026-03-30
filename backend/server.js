require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const facultyRoutes = require("./routes/facultyRoutes");
const jobRoutes = require("./routes/jobRoutes");
const authRoutes = require("./routes/authRoutes");
const app = express();
const profileRoutes = require("./routes/profileRoutes");
app.use(express.json());
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser or same-origin requests without an Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});




app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/jobs", jobRoutes);
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(`MongoDB Connected`);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => console.error("MongoDB connection error:", error));
 
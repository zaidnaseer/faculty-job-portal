const express = require("express")
const router = express.Router()
const multer = require("multer")
const pdfParse = require("pdf-parse")

const upload = multer()

router.post("/resume", upload.single("resume"), async (req, res) => {

  console.log("Parser route hit")

  try {

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const data = await pdfParse(req.file.buffer)
    const text = data.text.replace(/\r/g, "")

    const lines = text.split("\n").map(l => l.trim()).filter(Boolean)

    const name = lines[0] || ""

    const email = text.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/)?.[0] || ""

    const phone = text.match(/\+?\d[\d\s-]{8,}\d/)?.[0] || ""

    const summaryMatch = text.match(/(summary|about me|profile)([\s\S]*?)(skills|education|experience|publications)/i)
    const summary = summaryMatch ? summaryMatch[2].trim() : ""

    const skillsMatch = text.match(/skills([\s\S]*?)(education|experience|projects|publications)/i)

    const skills = skillsMatch
      ? skillsMatch[1]
          .split("\n")
          .map(s => s.replace(/[-•]/g, "").trim())
          .filter(Boolean)
      : []

    const educationMatch = text.match(/education([\s\S]*?)(experience|skills|projects|publications)/i)

    const education = educationMatch
      ? educationMatch[1]
          .split("\n")
          .map(e => e.trim())
          .filter(Boolean)
      : []

    const publicationMatch = text.match(/publications([\s\S]*?)(education|experience|skills|projects|references)/i)

    const publications = publicationMatch
      ? publicationMatch[1]
          .split("\n")
          .map(p => p.trim())
          .filter(Boolean)
      : []

    res.json({
      name,
      email,
      phone,
      summary,
      skills,
      education,
      publications
    })

  } catch (err) {

    console.error("Parser error:", err)
    res.status(500).json({ error: "Resume parsing failed", details: err.message })

  }

})

module.exports = router
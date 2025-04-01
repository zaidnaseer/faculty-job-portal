require('dotenv').config();
const { MongoClient } = require("mongodb");

const jobsData = [
    {
        id: 6,
        title: "Assistant Professor of Biology",
        department: "Biology",
        type: "Full-time",
        location: "Seattle, WA",
        postedDate: "Mar 05, 2025",
        description: "Faculty position focused on molecular biology. The successful candidate will establish a research program, teach undergraduate and graduate courses, and mentor students.",
        skills: ["Molecular Biology", "Cell Biology", "Lab Management", "Teaching"],
        featured: false,
        applied: false
      },
      {
        id: 7,
        title: "Professor of Practice in Business",
        department: "Business",
        type: "Full-time",
        location: "Austin, TX",
        postedDate: "Mar 02, 2025",
        description: "Professor of Practice position in the Business School. Looking for candidates with significant industry experience to teach practical business courses and develop industry partnerships.",
        skills: ["Business Strategy", "Leadership", "Industry Experience", "Entrepreneurship"],
        featured: false,
        applied: false
      },
      {
        id: 8,
        title: "Lecturer in Psychology",
        department: "Psychology",
        type: "Full-time",
        location: "Miami, FL",
        postedDate: "Feb 28, 2025",
        description: "Teaching-focused position in the Psychology Department. Primary responsibilities include undergraduate instruction in introductory and specialized psychology courses.",
        skills: ["Clinical Psychology", "Cognitive Psychology", "Research Methods", "Statistics"],
        featured: true,
        applied: false
      },
      {
        id: 9,
        title: "Research Professor in AI Ethics",
        department: "Computer Science",
        type: "Full-time",
        location: "San Francisco, CA",
        postedDate: "Mar 06, 2025",
        description: "Research-focused position specializing in AI ethics and responsible innovation. Will lead interdisciplinary research projects and develop new courses in this emerging field.",
        skills: ["AI Ethics", "Machine Learning", "Philosophy", "Policy"],
        featured: false,
        applied: false
      }
];

async function insertData() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("facultyDB");
    const collection = db.collection("jobs");

    // Insert mock data
    await collection.insertMany(jobsData);

    console.log("Jobs data inserted successfully!");
  } catch (error) {
    console.error("Error inserting jobs data:", error);
  } finally {
    await client.close();
  }
}

insertData();

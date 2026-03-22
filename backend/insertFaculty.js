require('dotenv').config();
const { MongoClient } = require("mongodb");

const jobsData = [
    {
        institution: "Northwest State University",
        title: "Assistant Professor of Biology",
        department: "Biology",
        type: "Full-time",
        location: "Seattle, WA",
        description: "Faculty position focused on molecular biology. The successful candidate will establish a research program, teach undergraduate and graduate courses, and mentor students.",
        skills: ["Molecular Biology", "Cell Biology", "Lab Management", "Teaching"],
        featured: false
      },
      {
        institution: "Capital Business University",
        title: "Professor of Practice in Business",
        department: "Business",
        type: "Full-time",
        location: "Austin, TX",
        description: "Professor of Practice position in the Business School. Looking for candidates with significant industry experience to teach practical business courses and develop industry partnerships.",
        skills: ["Business Strategy", "Leadership", "Industry Experience", "Entrepreneurship"],
        featured: false
      },
      {
        institution: "South Florida Institute",
        title: "Lecturer in Psychology",
        department: "Psychology",
        type: "Full-time",
        location: "Miami, FL",
        description: "Teaching-focused position in the Psychology Department. Primary responsibilities include undergraduate instruction in introductory and specialized psychology courses.",
        skills: ["Clinical Psychology", "Cognitive Psychology", "Research Methods", "Statistics"],
        featured: true
      },
      {
        institution: "Bay Area Tech University",
        title: "Research Professor in AI Ethics",
        department: "Computer Science",
        type: "Full-time",
        location: "San Francisco, CA",
        description: "Research-focused position specializing in AI ethics and responsible innovation. Will lead interdisciplinary research projects and develop new courses in this emerging field.",
        skills: ["AI Ethics", "Machine Learning", "Philosophy", "Policy"],
        featured: false
      }
];

async function getOrCreateHrUser(db) {
  const users = db.collection("users");

  let hrUser = await users.findOne({ email: "seed.hr@faculty-portal.local" });
  if (!hrUser) {
    const created = await users.insertOne({
      name: "Seed HR",
      email: "seed.hr@faculty-portal.local",
      role: "hr",
      university: "Seed University"
    });
    hrUser = { _id: created.insertedId };
  }

  return hrUser._id;
}

async function insertData() {
  const uri = process.env.MONGO_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = process.env.MONGO_DB_NAME ? client.db(process.env.MONGO_DB_NAME) : client.db();
    const collection = db.collection("jobs");
    const hrUserId = await getOrCreateHrUser(db);

    const documents = jobsData.map((job) => ({
      ...job,
      postedBy: hrUserId,
      appliedBy: [],
      postedDate: new Date()
    }));

    // Insert schema-compatible seed data
    await collection.insertMany(documents);

    console.log(`Seeded ${documents.length} jobs successfully.`);
  } catch (error) {
    console.error("Error inserting jobs data:", error);
  } finally {
    await client.close();
  }
}

insertData();

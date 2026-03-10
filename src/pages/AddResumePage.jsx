import { nav } from "framer-motion/client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RippleBackground from "../components/RippleBackground";

const AddResumePage = () => {
  const navigate = useNavigate(); // Hook to navigate to another page
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    summary: "",
    experience: [],
    education: [{ degree: "", institution: "", year: "", field: "" }],
    publications: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newPublication, setNewPublication] = useState({ title: '', description: '', link: '' });
  const [newExperience, setNewExperience] = useState({ title: "", institution: "", start: "", end: "", description: "", current: false });
  const [resumeFile, setResumeFile] = useState(null);

const handleResumeUpload = async (e) => {

  const file = e.target.files[0]

  const formDataUpload = new FormData()
  formDataUpload.append("resume", file)

  const res = await fetch("http://localhost:5000/api/parser/resume", {
    method: "POST",
    body: formDataUpload
  })

  const data = await res.json()

  setFormData(prev => ({
  ...prev,
  email: data.email || "",
  phone: data.phone || "",
  summary: data.summary || "",
  skills: data.skills || [],
  education: (data.education || []).map(e => ({ degree: e })),
  publications: (data.publications || []).map(p => ({ title: p }))
}))
}

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const newExperience = [...formData.experience];
    newExperience[index][name] = value;
    setFormData(prev => ({ ...prev, experience: newExperience }));
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const newEducation = [...formData.education];
    newEducation[index][name] = value;
    setFormData(prev => ({ ...prev, education: newEducation }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, { title: "", institution: "", start: "", end: "", description: "" }]
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "", field: "" }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resumeData = {
      ...formData,
    };
    try {
      const response = await fetch("http://localhost:5000/api/faculty/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(resumeData),
      });
      if (!response.ok) {
        throw new Error("Failed to add resume");
      }
      alert("Resume added successfully!");
      navigate("/resume");
    } catch (error) {
      console.error("Error adding resume:", error);
    }
  };

  // Skill handlers
  const handleSkillInputChange = (e) => setNewSkill(e.target.value);
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };
  const handleRemoveSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  // Publication handlers
  const handlePublicationInputChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddPublication = () => {
    if (newPublication.title.trim() && newPublication.description.trim()) {
      setFormData(prev => ({
        ...prev,
        publications: [...prev.publications, { ...newPublication }]
      }));
      setNewPublication({ title: '', description: '', link: '' });
    }
  };
  const handleRemovePublication = (index) => {
    setFormData(prev => ({ ...prev, publications: prev.publications.filter((_, i) => i !== index) }));
  };

  // Experience handlers
  const handleExperienceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleAddExperience = () => {
    if (newExperience.title && newExperience.institution) {
      setFormData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
      setNewExperience({ title: "", institution: "", start: "", end: "", description: "", current: false });
    }
  };
  const handleRemoveExperience = (index) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  return (
    <RippleBackground>
    <div className="container py-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add Pofile Info</h2>
        <div className="mb-6">
 
  <div className="mb-6">

<label className="font-semibold">
Upload Resume (PDF)
</label>

<input
type="file"
accept=".pdf"
onChange={handleResumeUpload}
className="border p-2 w-full"
/>

</div>
</div>

        {/* Basic Info */}
        <input
          type="text"
          name="name"
          value={formData.name}
          placeholder="Full Name"
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          placeholder="Email"
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          placeholder="Phone"
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />
        <textarea
          name="summary"
          value={formData.summary}
          placeholder="Professional Summary"
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          rows="3"
        />

        {/* Skills */}
        <h3 className="font-bold mt-4">Skills</h3>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newSkill}
            onChange={handleSkillInputChange}
            className="border p-2 flex-1"
            placeholder="Add a skill"
          />
          <button type="button" onClick={handleAddSkill} className="bg-blue-500 text-white px-4 py-2">Add Skill</button>
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {formData.skills.map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
              {skill}
              <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-1 text-red-500">&times;</button>
            </span>
          ))}
        </div>

        {/* Experience */}
        <h3 className="font-bold mt-4">Experience</h3>
        <div className="mb-4 border p-2 rounded">
          <input
            type="text"
            name="title"
            value={newExperience.title}
            placeholder="Job Title"
            onChange={handleExperienceInputChange}
            className="border p-2 w-full mb-2"
          />
          <input
            type="text"
            name="institution"
            value={newExperience.institution}
            placeholder="Company/Institution"
            onChange={handleExperienceInputChange}
            className="border p-2 w-full mb-2"
          />
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <label className="block text-xs mb-1">Start Date</label>
              <input
                type="month"
                name="start"
                value={newExperience.start}
                onChange={handleExperienceInputChange}
                className="border p-2 w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs mb-1">End Date</label>
              <input
                type="month"
                name="end"
                value={newExperience.end}
                onChange={handleExperienceInputChange}
                className="border p-2 w-full"
                disabled={newExperience.current}
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="current"
                checked={newExperience.current}
                onChange={handleExperienceInputChange}
                className="mr-2"
              />
              I currently work here
            </label>
          </div>
          <textarea
            name="description"
            value={newExperience.description}
            placeholder="Job Description"
            onChange={handleExperienceInputChange}
            className="border p-2 w-full mb-2"
            rows="2"
          />
          <button type="button" onClick={handleAddExperience} className="bg-blue-500 text-white px-4 py-2 w-full mb-2">Add Experience</button>
        </div>
        {formData.experience.map((exp, index) => (
          <div key={index} className="mb-4 border p-2 rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{exp.title}</div>
              <div className="text-gray-700">
                {exp.institution} (
                {exp.start ? new Date(exp.start + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }) : ''}
                {' - '}
                {exp.current ? 'Present' : (exp.end ? new Date(exp.end + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }) : '')}
                )
              </div>
              {exp.description && <div className="text-gray-600 text-sm mt-1">{exp.description}</div>}
            </div>
            <button type="button" onClick={() => handleRemoveExperience(index)} className="text-red-500 ml-2">Remove</button>
          </div>
        ))}
        {/* Publications */}
        <h3 className="font-bold mt-4">Publications</h3>
        <div className="flex flex-col md:flex-row gap-2 mb-2">
          <input
            type="text"
            name="title"
            value={newPublication.title}
            onChange={handlePublicationInputChange}
            className="border p-2 flex-1"
            placeholder="Publication Title"
          />
          <input
            type="text"
            name="description"
            value={newPublication.description}
            onChange={handlePublicationInputChange}
            className="border p-2 flex-1"
            placeholder="Key Details of Your Publication"
          />
          <input
            type="text"
            name="link"
            value={newPublication.link}
            onChange={handlePublicationInputChange}
            className="border p-2 flex-1"
            placeholder="Link (optional)"
          />
          <button type="button" onClick={handleAddPublication} className="bg-blue-500 text-white px-4 py-2">Add Publication</button>
        </div>
        <ul className="list-disc pl-5 mb-4">
          {formData.publications.map((pub, index) => (
            <li key={index} className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <div>
                <span className="font-semibold">{pub.title}</span>
                {pub.description && <span className="ml-2 text-gray-700">- {pub.description}</span>}
                {pub.link && (
                  <a href={pub.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 underline">[Link]</a>
                )}
              </div>
              <button type="button" onClick={() => handleRemovePublication(index)} className="text-red-500 ml-2">Remove</button>
            </li>
          ))}
        </ul>

        {/* Education */}
        <h3 className="font-bold mt-4">Education</h3>
        {formData.education.map((edu, index) => (
          <div key={index} className="mb-4 border p-2">
            <input
              type="text"
              name="degree"
              value={edu.degree}
              placeholder="Degree"
              onChange={(e) => handleEducationChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="institution"
              value={edu.institution}
              placeholder="Institution"
              onChange={(e) => handleEducationChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="year"
              value={edu.year}
              placeholder="Year"
              onChange={(e) => handleEducationChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="field"
              value={edu.field}
              placeholder="Field of Study"
              onChange={(e) => handleEducationChange(index, e)}
              className="border p-2 w-full mb-2"
            />
          </div>
        ))}
        <button type="button" onClick={addEducation} className="bg-gray-500 text-white px-4 py-2 w-full mb-2">
          + Add Education
        </button>

        {/* Submit */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full">
          Save Profile
        </button>
      </form>
    </div>
    </RippleBackground>
  );
};

export default AddResumePage;

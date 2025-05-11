import { useState } from "react";

const AddResumePage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    summary: "",
    experience: [{ title: "", institution: "", start: "", end: "", description: "" }],
    education: [{ degree: "", institution: "", year: "", field: "" }],
  });

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
      skills: formData.skills.split(",").map(skill => skill.trim()), // Convert skills to array
    };

    try {
      const response = await fetch("http://localhost:5000/api/faculty/resume", {
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
    } catch (error) {
      console.error("Error adding resume:", error);
    }
  };

  return (
    <div className="container py-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Add Resume</h2>

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
        <input
          type="text"
          name="skills"
          value={formData.skills}
          placeholder="Skills (comma separated)"
          onChange={handleChange}
          className="border p-2 w-full mb-2"
          required
        />

        {/* Experience */}
        <h3 className="font-bold mt-4">Experience</h3>
        {formData.experience.map((exp, index) => (
          <div key={index} className="mb-4 border p-2">
            <input
              type="text"
              name="title"
              value={exp.title}
              placeholder="Job Title"
              onChange={(e) => handleExperienceChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="text"
              name="institution"
              value={exp.institution}
              placeholder="Company/Institution"
              onChange={(e) => handleExperienceChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="date"
              name="start"
              value={exp.start}
              onChange={(e) => handleExperienceChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <input
              type="date"
              name="end"
              value={exp.end}
              onChange={(e) => handleExperienceChange(index, e)}
              className="border p-2 w-full mb-2"
            />
            <textarea
              name="description"
              value={exp.description}
              placeholder="Job Description"
              onChange={(e) => handleExperienceChange(index, e)}
              className="border p-2 w-full mb-2"
              rows="2"
            />
          </div>
        ))}
        <button type="button" onClick={addExperience} className="bg-gray-500 text-white px-4 py-2 w-full mb-2">
          + Add Experience
        </button>

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
          Save Resume
        </button>
      </form>
    </div>
  );
};

export default AddResumePage;

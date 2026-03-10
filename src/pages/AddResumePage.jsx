import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RippleBackground from "../components/RippleBackground";

const AddResumePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: [],
    summary: "",
    experience: [],
    education: [],
    publications: [],
  });

  const [newSkill, setNewSkill] = useState("");
  const [newPublication, setNewPublication] = useState({ title: '', description: '', link: '' });
  const [newExperience, setNewExperience] = useState({ title: "", institution: "", start: "", end: "", description: "", current: false });
  const [newEducation, setNewEducation] = useState({ degree: "", institution: "", year: "", field: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [fileError, setFileError] = useState("");

const handleResumeUpload = (e) => {
  const file = e.target.files[0];
  setFileError("");
  
  if (file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/rtf', 'text/rtf'];
    if (!allowedTypes.includes(file.type)) {
      setFileError('Invalid file type. Only PDF, Word (.doc, .docx), TXT, and RTF documents are allowed.');
      e.target.value = '';
      return;
    }
    
    // Validate file size (5MB = 5 * 1024 * 1024 bytes)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB limit. Please choose a smaller file.');
      e.target.value = '';
      return;
    }
    
    setResumeFile(file);
  }
};

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

  const handleEducationInputChange = (e) => {
    const { name, value } = e.target;
    setNewEducation(prev => ({ ...prev, [name]: value }));
  };

  const handleAddEducation = () => {
    if (newEducation.degree && newEducation.institution) {
      setFormData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
      setNewEducation({ degree: "", institution: "", year: "", field: "" });
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('summary', formData.summary);
      formDataToSend.append('skills', JSON.stringify(formData.skills));
      formDataToSend.append('experience', JSON.stringify(formData.experience));
      formDataToSend.append('education', JSON.stringify(formData.education));
      formDataToSend.append('publications', JSON.stringify(formData.publications));
      
      // Add resume file if uploaded
      if (resumeFile) {
        formDataToSend.append('resume', resumeFile);
      }
      
      const response = await fetch("http://localhost:5000/api/faculty/add", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
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
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Create Your Resume</h1>
          <p className="text-gray-600">Fill in your professional details to build your profile</p>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 md:p-8 mb-6 border border-blue-400">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-shrink-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                </svg>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Upload Resume</h3>
              <p className="text-blue-100 text-sm mb-2">Upload your resume to include with your profile</p>
              <p className="text-blue-200 text-xs mb-4">Accepted formats: PDF, DOC, DOCX, TXT, RTF | Max size: 5MB</p>
              {resumeFile && <span className="inline-block mb-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs">✓ {resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB)</span>}
              {fileError && <p className="text-red-200 bg-red-500/30 px-3 py-2 rounded-lg text-xs mb-4">{fileError}</p>}
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/rtf,text/rtf"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
                <div className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  Choose PDF File
                </div>
              </label>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">1</span>
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                placeholder="Full Name"
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email Address"
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              placeholder="Phone Number"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full mt-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              required
            />
            <textarea
              name="summary"
              value={formData.summary}
              placeholder="Professional Summary - Tell us about yourself and your career highlights"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg p-3 w-full mt-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
              rows="4"
            />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">2</span>
              Skills & Expertise
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={handleSkillInputChange}
                className="border border-gray-300 rounded-lg p-3 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                placeholder="Enter a skill (e.g., React, Python, Leadership)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              />
              <button 
                type="button" 
                onClick={handleAddSkill} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                Add
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <span key={index} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-full text-sm flex items-center shadow-sm hover:shadow-md transition-shadow">
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-2 hover:bg-white hover:text-blue-600 rounded-full w-5 h-5 flex items-center justify-center transition-colors">&times;</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">3</span>
              Work Experience
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  value={newExperience.title}
                  placeholder="Job Title"
                  onChange={handleExperienceInputChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                <input
                  type="text"
                  name="institution"
                  value={newExperience.institution}
                  placeholder="Company/Institution"
                  onChange={handleExperienceInputChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="month"
                    name="start"
                    value={newExperience.start}
                    onChange={handleExperienceInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="month"
                    name="end"
                    value={newExperience.end}
                    onChange={handleExperienceInputChange}
                    className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:bg-gray-100"
                    disabled={newExperience.current}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="current"
                    checked={newExperience.current}
                    onChange={handleExperienceInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-gray-700">I currently work here</span>
                </label>
              </div>
              <textarea
                name="description"
                value={newExperience.description}
                placeholder="Describe your responsibilities and achievements..."
                onChange={handleExperienceInputChange}
                className="border border-gray-300 rounded-lg p-3 w-full mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                rows="3"
              />
              <button 
                type="button" 
                onClick={handleAddExperience} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                + Add Experience
              </button>
            </div>
            {formData.experience.length > 0 && (
              <div className="space-y-3">
                {formData.experience.map((exp, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">{exp.title}</h4>
                        <p className="text-blue-600 font-medium">{exp.institution}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {exp.start ? new Date(exp.start + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }) : ''}
                          {' - '}
                          {exp.current ? 'Present' : (exp.end ? new Date(exp.end + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }) : '')}
                        </p>
                        {exp.description && <p className="text-gray-600 text-sm mt-2">{exp.description}</p>}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveExperience(index)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors ml-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">4</span>
              Publications & Research
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 border border-gray-200">
              <div className="grid gap-4 mb-4">
                <input
                  type="text"
                  name="title"
                  value={newPublication.title}
                  onChange={handlePublicationInputChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Publication Title"
                />
                <input
                  type="text"
                  name="description"
                  value={newPublication.description}
                  onChange={handlePublicationInputChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Key Details of Your Publication"
                />
                <input
                  type="url"
                  name="link"
                  value={newPublication.link}
                  onChange={handlePublicationInputChange}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Link (optional)"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddPublication} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg w-full font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                + Add Publication
              </button>
            </div>
            {formData.publications.length > 0 && (
              <div className="space-y-3">
                {formData.publications.map((pub, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{pub.title}</h4>
                        {pub.description && <p className="text-gray-600 text-sm mt-1">{pub.description}</p>}
                        {pub.link && (
                          <a href={pub.link} target="_blank" rel=" noopener noreferrer" className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View Publication
                            <svg className="w-4 h-4 ml-1"fill="currentColor" viewBox="0 0 20 20">
                              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                            </svg>
                          </a>
                        )}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemovePublication(index)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors ml-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3">5</span>
              Education
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-4 border border-gray-200">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="degree"
                  value={newEducation.degree}
                  onChange={handleEducationInputChange}
                  placeholder="Degree (e.g., Bachelor of Science)"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                <input
                  type="text"
                  name="field"
                  value={newEducation.field}
                  onChange={handleEducationInputChange}
                  placeholder="Field of Study"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                <input
                  type="text"
                  name="institution"
                  value={newEducation.institution}
                  onChange={handleEducationInputChange}
                  placeholder="Institution Name"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
                <input
                  type="text"
                  name="year"
                  value={newEducation.year}
                  onChange={handleEducationInputChange}
                  placeholder="Year (e.g., 2020)"
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddEducation} 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg w-full mt-4 font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                + Add Education
              </button>
            </div>
            {formData.education.length > 0 && (
              <div className="space-y-3">
                {formData.education.map((edu, index) => (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-lg">{edu.degree}{edu.field && ` in ${edu.field}`}</h4>
                        <p className="text-blue-600 font-medium">{edu.institution}</p>
                        {edu.year && <p className="text-gray-500 text-sm mt-1">{edu.year}</p>}
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveEducation(index)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2 transition-colors ml-4"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-center">
            <button 
              type="submit" 
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-bold text-lg w-full md:w-auto md:min-w-[300px] transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Save Resume
            </button>
            <p className="text-blue-100 text-sm mt-4">Click to save your resume and create your profile</p>
          </div>
        </form>
      </div>
    </div>
    </RippleBackground>
  );
};

export default AddResumePage;

import { useState } from 'react';
import VideoUploader from './VideoUploader';

const ResumeEditor = ({ initialResume, userId }) => {
  const [resume, setResume] = useState(initialResume || {
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    education: [],
    experience: [],
    skills: [],
    publications: [],
    profileImage: '',
    introVideo: ''
  });

  // For adding skills, publications, and experience
  const [newSkill, setNewSkill] = useState('');
  const [newPublication, setNewPublication] = useState({ title: '', description: '', link: '' });
  const [newExperience, setNewExperience] = useState({ title: '', institution: '', start: '', end: '', description: '', current: false });

  const [isEditing, setIsEditing] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [expAdded, setExpAdded] = useState(false);
  const [expError, setExpError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setResume(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEducation = [...resume.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [name]: value
    };
    setResume(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const handleExperienceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedExperience = [...resume.experience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [name]: value
    };
    setResume(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };

  const addEducation = () => {
    setResume(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { degree: '', institution: '', year: '', field: '' }
      ]
    }));
  };

  const addExperience = () => {
    setResume(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: '', institution: '', start: '', end: '', description: '' }
      ]
    }));
  };

  const removeEducation = (index) => {
    setResume(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const removeExperience = (index) => {
    setResume(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };


  const handleSkillInputChange = (e) => setNewSkill(e.target.value);
  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };
  const handleRemoveSkill = (index) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handlePublicationInputChange = (e) => {
    const { name, value } = e.target;
    setNewPublication((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddPublication = () => {
    if (newPublication.title.trim() && newPublication.description.trim()) {
      setResume((prev) => ({
        ...prev,
        publications: [...(prev.publications || []), { ...newPublication }],
      }));
      setNewPublication({ title: '', description: '', link: '' });
    }
  };
  const handleRemovePublication = (index) => {
    setResume((prev) => ({
      ...prev,
      publications: prev.publications.filter((_, i) => i !== index),
    }));
    <div>
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
          placeholder="Description / Key Details"
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
        {resume.publications && resume.publications.length > 0 && resume.publications.map((pub, index) => (
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
    </div>
  };

  const handleExperienceInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewExperience(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  const handleAddExperience = () => {
    setExpError("");
    if (!newExperience.title || !newExperience.institution) {
      setExpError("Title and Institution are required.");
      return;
    }
    if (!newExperience.current && newExperience.start && newExperience.end && newExperience.end < newExperience.start) {
      setExpError("End date cannot be before start date.");
      return;
    }
    setResume(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
    setNewExperience({ title: '', institution: '', start: '', end: '', description: '', current: false });
    setExpAdded(true);
    setTimeout(() => setExpAdded(false), 1500);
  };
  const handleRemoveExperience = (index) => {
    setResume(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving resume:', resume);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      console.log("creating a response", resume);
      const response = await fetch(`http://localhost:5000/api/faculty/update/${resume._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resume),
      });

      console.log("reacher a resposne");
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedData = await response.json();
      console.log("Resume updated successfully:", updatedData);

      // ✅ Update state with the new data
      setResume(updatedData);

      alert('Resume updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update resume:', error);
      alert('Failed to update resume. Please try again.');
    }
  };

  const handleVideoUpload = (videoUrl) => {
    setResume(prev => ({
      ...prev,
      introVideo: videoUrl
    }));
  };

  // ✅ New function to apply for a job
  const applyForJob = (job) => {
    if (!appliedJobs.find(j => j.title === job.title)) {
      setAppliedJobs(prev => [...prev, job]);
      alert(`Successfully applied for ${job.title}`);
    } else {
      alert(`You have already applied for ${job.title}`);
    }
  };

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty Resume</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="btn btn-outline">Cancel</button>
            <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">Edit Resume</button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <img
              src={resume.profileImage || "/assets/default-profile.jpg"}
              alt={resume.name}
              className="w-40 h-40 object-cover rounded-full mb-4"
            />
            {isEditing && <button className="btn btn-outline text-sm mb-4">Change Photo</button>}
            <h3 className="text-xl font-bold">{resume.name}</h3>
            {isEditing ? (
              <div className="mb-2">
                <label className="block text-xs mb-1" htmlFor="resume-title">Title</label>
                <input id="resume-title" type="text" name="title" value={resume.title} onChange={handleChange} className="form-input text-center w-full" />
              </div>
            ) : (
              <p className="text-gray-600">{resume.title}</p>
            )}

            {/* Contact Information */}
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Contact Information</h4>
              {isEditing ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs mb-1" htmlFor="resume-email">Email</label>
                    <input id="resume-email" type="email" name="email" value={resume.email} onChange={handleChange} className="form-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" htmlFor="resume-phone">Phone</label>
                    <input id="resume-phone" type="tel" name="phone" value={resume.phone} onChange={handleChange} className="form-input w-full" />
                  </div>
                  <div>
                    <label className="block text-xs mb-1" htmlFor="resume-location">Location</label>
                    <input id="resume-location" type="text" name="location" value={resume.location} onChange={handleChange} className="form-input w-full" />
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <p>Email: {resume.email}</p>
                  <p>Phone: {resume.phone}</p>
                  <p>Location: {resume.location}</p>
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Skills</h4>
              {isEditing ? (
                <div>
                  <div className="flex gap-2 mb-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs mb-1" htmlFor="skill-input">Add Skill</label>
                      <input id="skill-input" type="text" value={newSkill} onChange={handleSkillInputChange} className="form-input w-full" />
                    </div>
                    <button type="button" onClick={handleAddSkill} className="btn btn-primary">Add Skill</button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {resume.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                        {skill}
                        <button type="button" onClick={() => handleRemoveSkill(index)} className="ml-1 text-red-500">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {resume.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resume Details Section */}
        <div className="md:col-span-2">
          {/* About Me */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">About Me</h3>
            {isEditing ? (
              <div>
                <label className="block text-xs mb-1" htmlFor="resume-summary">About Me</label>
                <textarea id="resume-summary" name="summary" value={resume.summary} onChange={handleChange} className="form-input h-32 w-full" />
              </div>
            ) : (
              <p className="text-gray-700">{resume.summary}</p>
            )}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Education</h3>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-4">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs mb-1" htmlFor={`edu-degree-${index}`}>Degree</label>
                      <input id={`edu-degree-${index}`} type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} className="form-input w-full" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1" htmlFor={`edu-institution-${index}`}>Institution</label>
                      <input id={`edu-institution-${index}`} type="text" name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} className="form-input w-full" />
                    </div>
                  </div>
                ) : (
                  <p>{edu.degree} - {edu.institution}</p>
                )}
              </div>
            ))}
          </div>

          {/* Work Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Work Experience</h3>
            {isEditing && (
              <div className="mb-4 border p-2 rounded">
                {expAdded && (
                  <div className="mb-2 text-green-600 text-sm font-semibold transition">Experience added!</div>
                )}
                {expError && (
                  <div className="mb-2 text-red-600 text-sm font-semibold transition">{expError}</div>
                )}
                <div className="mb-2">
                  <label className="block text-xs mb-1" htmlFor="exp-title">Job Title</label>
                  <input id="exp-title" type="text" name="title" value={newExperience.title} onChange={handleExperienceInputChange} className="form-input w-full" />
                </div>
                <div className="mb-2">
                  <label className="block text-xs mb-1" htmlFor="exp-institution">Company/Institution</label>
                  <input id="exp-institution" type="text" name="institution" value={newExperience.institution} onChange={handleExperienceInputChange} className="form-input w-full" />
                </div>
                <div className="flex gap-2 mb-2">
                  <div className="flex-1">
                    <label className="block text-xs mb-1">Start Date</label>
                    <input
                      type="month"
                      name="start"
                      value={newExperience.start || ""}
                      onChange={handleExperienceInputChange}
                      className="form-input w-full"
                      required
                      max={newExperience.end || undefined}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1">End Date</label>
                    <input
                      type="month"
                      name="end"
                      value={newExperience.end || ""}
                      onChange={handleExperienceInputChange}
                      className="form-input w-full"
                      disabled={newExperience.current}
                      required={!newExperience.current}
                      min={newExperience.start || undefined}
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="inline-flex items-center text-sm">
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
                <div className="mb-2">
                  <label className="block text-xs mb-1" htmlFor="exp-description">Job Description</label>
                  <textarea id="exp-description" name="description" value={newExperience.description} onChange={handleExperienceInputChange} className="form-input w-full" rows="2" />
                </div>
                <button type="button" onClick={handleAddExperience} className="btn btn-primary w-full">Add Experience</button>
              </div>
            )}
            {[...resume.experience]
              .sort((a, b) => {
                // Sort by start date descending (most recent first)
                if (!a.start && !b.start) return 0;
                if (!a.start) return 1;
                if (!b.start) return -1;
                return b.start.localeCompare(a.start);
              })
              .map((exp, index) => (
                <div key={index} className="mb-4 border p-2 rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{exp.title}</h4>
                      <p className="text-gray-700">{exp.institution} ({exp.start} to {exp.end || "Present"})</p>
                      {exp.description && <p className="text-gray-600 text-sm mt-1">{exp.description}</p>}
                    </div>
                    {isEditing && (
                      <button type="button" onClick={() => handleRemoveExperience(index)} className="text-red-500 ml-2">Remove</button>
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Publications */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Publications</h3>
            {isEditing ? (
              <div>
                <div>
                  <div className='mb-2'>
                    <label className="block text-xs mb-1" htmlFor="publication-title">Title</label>
                    <input
                      id="publication-title"
                      type="text"
                      name="title"
                      value={newPublication.title}
                      onChange={handlePublicationInputChange}
                      className="form-input w-full"
                      placeholder="Publication Title"
                    />
                  </div>
                  <div className='mb-2'>
                    <label className="block text-xs mb-1" htmlFor="publication-description">Description</label>
                    <input
                      id="publication-description"
                      type="text"
                      name="description"
                      value={newPublication.description}
                      onChange={handlePublicationInputChange}
                      className="form-input w-full"
                      placeholder="Key Details"
                    />
                  </div>
                  <div className='mb-2'>
                    <label className="block text-xs mb-1" htmlFor="publication-link">Link (optional)</label>
                    <input
                      id="publication-link"
                      type="text"
                      name="link"
                      value={newPublication.link}
                      onChange={handlePublicationInputChange}
                      className="form-input w-full"
                      placeholder="Link (optional)"
                    />
                  </div>
                  <button type="button" onClick={handleAddPublication} className="btn btn-primary mb-2">Add Publication</button>
                </div>
                {resume.publications && resume.publications.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 mb-4">
                    {resume.publications.map((pub, index) => (
                      <div key={index} className="bg-white shadow rounded p-4 flex flex-col justify-between h-full border">
                        <div>
                          <div className="font-semibold text-lg mb-1">{pub.title}</div>
                          {pub.description && <div className="text-gray-700 mb-2">{pub.description}</div>}
                          {pub.link && (
                            <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">[Link]</a>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePublication(index)}
                          className="text-red-500 mt-3 self-end"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No publications added.</p>
                )}
              </div>
            ) : (
              resume.publications && resume.publications.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 mb-4">
                  {resume.publications.map((pub, index) => (
                    <div key={index} className="bg-white shadow rounded p-4 border">
                      <div className="font-semibold text-lg mb-1">{pub.title}</div>
                      {pub.description && <div className="text-gray-700 mb-2">{pub.description}</div>}
                      {pub.link && (
                        <a href={pub.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">[Visit]</a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No publications added.</p>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResumeEditor;
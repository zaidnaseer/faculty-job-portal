import { useState } from 'react';
import VideoUploader from './VideoUploader';

const ResumeEditor = ({ initialResume,userId }) => {

  
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
    publications: '',
    profileImage: '',
    introVideo: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState([]);

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

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setResume(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleSave = async () => {
    try {
      console.log('Saving resume:', resume);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      console.log("creating a resposne",resume);
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
              <input type="text" name="title" value={resume.title} onChange={handleChange} className="form-input mt-2 text-center" />
            ) : (
              <p className="text-gray-600">{resume.title}</p>
            )}

            {/* Contact Information */}
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Contact Information</h4>
              {isEditing ? (
                <div className="space-y-2">
                  <input type="email" name="email" value={resume.email} onChange={handleChange} className="form-input" placeholder="Email" />
                  <input type="tel" name="phone" value={resume.phone} onChange={handleChange} className="form-input" placeholder="Phone" />
                  <input type="text" name="location" value={resume.location} onChange={handleChange} className="form-input" placeholder="Location" />
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
                <textarea name="skills" value={resume.skills.join(", ")} onChange={handleSkillsChange} className="form-input h-24" placeholder="Skills (comma separated)" />
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
              <textarea name="summary" value={resume.summary} onChange={handleChange} className="form-input h-32" placeholder="Write about yourself" />
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
                    <input type="text" name="degree" value={edu.degree} onChange={(e) => handleEducationChange(index, e)} className="form-input" placeholder="Degree" />
                    <input type="text" name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} className="form-input" placeholder="Institution" />
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
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold">{exp.title}</h4>
                <p className="text-gray-700">{exp.institution} ({exp.start} - {exp.end || "Present"})</p>
              </div>
            ))}
          </div>

          {/* Publications */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Publications</h3>
            {isEditing ? (
              <textarea name="publications" value={resume.publications} onChange={handleChange} className="form-input h-32" />
            ) : (
              <p>{resume.publications}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResumeEditor;

import { useState } from 'react';
import VideoUploader from './VideoUploader';

const ResumeEditor = ({ initialResume }) => {
  const [resume, setResume] = useState(initialResume);
  const [isEditing, setIsEditing] = useState(false);
  
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
  
  const handleSave = () => {
    setIsEditing(false);
    // In a real app, we would send an API request to update the resume
    alert('Resume updated successfully!');
  };
  
  const handleVideoUpload = (videoUrl) => {
    setResume(prev => ({
      ...prev,
      introVideo: videoUrl
    }));
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty Resume</h2>
        {isEditing ? (
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(false)} className="btn btn-outline">
              Cancel
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              Save Changes
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary">
            Edit Resume
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <img 
              src={resume.profileImage || "/assets/default-profile.jpg"} 
              alt={resume.name}
              className="w-40 h-40 object-cover rounded-full mb-4"
            />
            
            {isEditing && (
              <button className="btn btn-outline text-sm mb-4">
                Change Photo
              </button>
            )}
            
            <h3 className="text-xl font-bold">{resume.name}</h3>
            {isEditing ? (
              <input
                type="text"
                name="title"
                value={resume.title}
                onChange={handleChange}
                className="form-input mt-2 text-center"
              />
            ) : (
              <p className="text-gray-600">{resume.title}</p>
            )}
            
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Contact Information</h4>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    name="email"
                    value={resume.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Email"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={resume.phone}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    name="location"
                    value={resume.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Location"
                  />
                </div>
              ) : (
                <div className="space-y-1 text-sm">
                  <p>Email: {resume.email}</p>
                  <p>Phone: {resume.phone}</p>
                  <p>Location: {resume.location}</p>
                </div>
              )}
            </div>
            
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Skills</h4>
              {isEditing ? (
                <textarea
                  name="skills"
                  value={resume.skills.join(', ')}
                  onChange={handleSkillsChange}
                  className="form-input h-24"
                  placeholder="Skills (comma separated)"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {resume.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Introduction Video</h4>
              {resume.introVideo ? (
                <div className="mt-2">
                  <video 
                    src={resume.introVideo} 
                    controls 
                    className="w-full rounded-lg"
                  />
                  {isEditing && (
                    <button className="btn btn-outline text-sm mt-2 w-full">
                      Replace Video
                    </button>
                  )}
                </div>
              ) : (
                isEditing && <VideoUploader onUpload={handleVideoUpload} />
              )}
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">About Me</h3>
            {isEditing ? (
              <textarea
                name="summary"
                value={resume.summary}
                onChange={handleChange}
                className="form-input h-32"
                placeholder="Write a brief summary about yourself"
              />
            ) : (
              <p className="text-gray-700">{resume.summary}</p>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-bold">Education</h3>
              {isEditing && (
                <button onClick={addEducation} className="text-primary text-sm">
                  + Add Education
                </button>
              )}
            </div>
            
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 flex justify-between">
                      <input
                        type="text"
                        name="degree"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, e)}
                        className="form-input w-full md:w-3/4"
                        placeholder="Degree"
                      />
                      <button 
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      name="institution"
                      value={edu.institution}
                      onChange={(e) => handleEducationChange(index, e)}
                      className="form-input"
                      placeholder="Institution"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="year"
                        value={edu.year}
                        onChange={(e) => handleEducationChange(index, e)}
                        className="form-input"
                        placeholder="Year"
                      />
                      <input
                        type="text"
                        name="field"
                        value={edu.field}
                        onChange={(e) => handleEducationChange(index, e)}
                        className="form-input"
                        placeholder="Field of Study"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <span className="text-gray-600">{edu.year}</span>
                    </div>
                    <p className="text-gray-700">{edu.institution}</p>
                    <p className="text-gray-600 text-sm">{edu.field}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center border-b pb-2 mb-3">
              <h3 className="text-lg font-bold">Work Experience</h3>
              {isEditing && (
                <button onClick={addExperience} className="text-primary text-sm">
                  + Add Experience
                </button>
              )}
            </div>
            
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <input
                        type="text"
                        name="title"
                        value={exp.title}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="form-input w-full md:w-3/4"
                        placeholder="Job Title"
                      />
                      <button 
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      name="institution"
                      value={exp.institution}
                      onChange={(e) => handleExperienceChange(index, e)}
                      className="form-input"
                      placeholder="Institution/Company"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="start"
                        value={exp.start}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="form-input"
                        placeholder="Start Date"
                      />
                      <input
                        type="text"
                        name="end"
                        value={exp.end}
                        onChange={(e) => handleExperienceChange(index, e)}
                        className="form-input"
                        placeholder="End Date"
                      />
                    </div>
                    <textarea
                      name="description"
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, e)}
                      className="form-input h-24"
                      placeholder="Job Description"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between">
                      <h4 className="font-semibold">{exp.title}</h4>
                      <span className="text-gray-600">{exp.start} - {exp.end || 'Present'}</span>
                    </div>
                    <p className="text-gray-700">{exp.institution}</p>
                    <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Publications</h3>
            {isEditing ? (
              <textarea
                name="publications"
                value={resume.publications}
                onChange={handleChange}
                className="form-input h-32"
                placeholder="List your publications"
              />
            ) : (
              <div dangerouslySetInnerHTML={{ __html: resume.publications.replace(/\n/g, '<br />') }} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor;

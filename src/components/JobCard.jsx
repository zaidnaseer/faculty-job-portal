import { useState } from 'react';
import { FaRegBookmark, FaBookmark, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const JobCard = ({ job, featured = false }) => {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(job.applied || false);
  
  const toggleSave = () => {
    setSaved(!saved);
  };
  
  const applyForJob = () => {
    setApplied(true);
    // In a real app, we would send an API request to apply
    alert(`Applied for ${job.title}! In a real app, this would submit your resume.`);
  };

  return (
    <div className={`card h-full flex flex-col ${featured ? 'border-l-4 border-primary' : ''}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold">{job.title}</h3>
          <p className="text-gray-600">{job.department}</p>
        </div>
        <button onClick={toggleSave} className="text-gray-400 hover:text-primary">
          {saved ? <FaBookmark className="text-primary" /> : <FaRegBookmark />}
        </button>
      </div>
      
      <div className="mt-4 space-y-2 text-sm text-gray-500">
        <div className="flex items-center">
          <FaBriefcase className="mr-2" />
          <span>{job.type}</span>
        </div>
        <div className="flex items-center">
          <FaMapMarkerAlt className="mr-2" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center">
          <FaCalendarAlt className="mr-2" />
          <span>Posted: {job.postedDate}</span>
        </div>
      </div>
      
      <div className="mt-4 line-clamp-2 text-sm">
        {job.description}
      </div>
      
      <div className="mt-auto pt-4">
        <div className="flex gap-2 text-sm">
          {job.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
              +{job.skills.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-4">
          {applied ? (
            <button disabled className="btn btn-outline w-full opacity-75">
              Applied
            </button>
          ) : (
            <button onClick={applyForJob} className="btn btn-primary w-full">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;

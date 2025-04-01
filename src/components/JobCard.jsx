import { useState, useEffect } from "react";
import { FaRegBookmark, FaBookmark, FaBriefcase, FaMapMarkerAlt, FaCalendarAlt } from "react-icons/fa";

const JobCard = ({ job, userId, featured = false }) => {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);

  // Check if the current user has already applied for the job
  useEffect(() => {
    if (job.appliedBy && job.appliedBy.includes(userId)) {
      setApplied(true); // If the userId is found in appliedBy array, set applied to true
    }
  }, [job.appliedBy, userId]);

  const toggleSave = () => {
    setSaved(!saved);
  };

  const applyForJob = async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/apply/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApplied(true); // Mark the job as applied
        alert("Successfully applied for the job");
      } else {
        alert(data.message || "Failed to apply for job");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className={`card h-full flex flex-col ${featured ? "border-l-4 border-primary" : ""}`}>
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

      <div className="mt-4 line-clamp-2 text-sm">{job.description}</div>

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
            <button onClick={() => applyForJob(job._id)} className="btn btn-primary w-full">
              Apply Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;

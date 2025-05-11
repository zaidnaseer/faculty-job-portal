import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs/my-jobs", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleViewResume = (facultyId) => {
    navigate("/display-resume", { state: { facultyId } });
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
  
    try {
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
  
      if (response.ok) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      } else {
        console.error("Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  };
  
  if (loading) {
    return <p className="text-center text-gray-600">Loading jobs...</p>;
  }

  return (
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">HR Dashboard</h2>

      {jobs.length === 0 ? (
        <p>No jobs posted yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job._id} className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p className="text-gray-600">{job.department} • {job.location}</p>
              <p className="text-sm text-gray-500">{job.type} • Posted on {new Date(job.postedDate).toLocaleDateString()}</p>
              
              <h4 className="font-semibold mt-4">Applicants:</h4>
              {job.appliedBy.length > 0 ? (
                <ul className="mt-2">
                  {job.appliedBy.map((faculty) => (
                    <li key={faculty._id} className="text-sm text-gray-700">
                      {faculty.name} ({faculty.email})
                      <button
                        onClick={() => handleViewResume(faculty._id)} // Use handleViewResume to navigate
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        View Resume
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No applicants yet</p>
              )}
              <button
  onClick={() => handleDeleteJob(job._id)}
  className="mt-3 text-red-600 hover:underline text-sm"
>
  Delete Job
</button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HRDashboard;

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import RippleBackground from "../components/RippleBackground";

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
    <RippleBackground>
    <div className="container py-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-800">HR Dashboard</h2>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center mt-16">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No jobs posted yet. Start by posting a new job!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xl text-blue-700">{job.title}</h3>
                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded">{job.type}</span>
              </div>
              <p className="text-gray-600 mb-1">{job.department} • {job.location}</p>
              <p className="text-xs text-gray-400 mb-4">Posted on {new Date(job.postedDate).toLocaleDateString()}</p>

              <h4 className="font-semibold mt-2 mb-1 text-gray-800">Applicants:</h4>
              {job.appliedBy.length > 0 ? (
                <div className="flex items-center mb-2">
                  <span className="text-blue-700 font-bold">{job.appliedBy.length}</span>
                  <span className="text-gray-600 ml-2 text-sm">applicant{job.appliedBy.length > 1 ? 's' : ''}</span>
                  <button
                    onClick={() => navigate(`/job-applicants/${job._id}`)}
                    className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition"
                  >
                    View All
                  </button>
                </div>
              ) : (
                <p className="text-gray-400 text-sm mb-2">No applicants yet</p>
              )}
              <button
                onClick={() => handleDeleteJob(job._id)}
                className="mt-auto px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm transition self-end"
              >
                Delete Job
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
    </RippleBackground>
  );
};

export default HRDashboard;

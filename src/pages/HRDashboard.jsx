import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedResume, setSelectedResume] = useState(null); // State to hold selected resume data
  const [loadingResume, setLoadingResume] = useState(false);

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

  const fetchResume = async (facultyId) => {
    setLoadingResume(true);
    try {
      const response = await fetch(`http://localhost:5000/api/resume/${facultyId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const data = await response.json();
      setSelectedResume(data);
    } catch (error) {
      console.error("Error fetching resume:", error);
    } finally {
      setLoadingResume(false);
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
                        onClick={() => fetchResume(faculty._id)}
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
            </div>
          ))}
        </div>
      )}

      {selectedResume && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {loadingResume ? (
              <p>Loading resume...</p>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-4">{selectedResume.name}</h3>
                <p><strong>Email:</strong> {selectedResume.email}</p>
                <p><strong>Phone:</strong> {selectedResume.phone}</p>
                <p><strong>Skills:</strong> {selectedResume.skills.join(", ")}</p>
                <h4 className="font-semibold mt-4">Experience:</h4>
                <ul>
                  {selectedResume.experience.map((exp, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      <strong>{exp.title}</strong> at {exp.institution} ({exp.start} - {exp.end})
                      <p>{exp.description}</p>
                    </li>
                  ))}
                </ul>
                <h4 className="font-semibold mt-4">Education:</h4>
                <ul>
                  {selectedResume.education.map((edu, index) => (
                    <li key={index} className="text-sm text-gray-700">
                      <strong>{edu.degree}</strong> in {edu.field} from {edu.institution} ({edu.year})
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedResume(null)}
                  className="mt-4 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;

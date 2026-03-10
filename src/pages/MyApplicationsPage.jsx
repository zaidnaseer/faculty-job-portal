import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import RippleBackground from "../components/RippleBackground";

const MyApplicationsPage = () => {
  const { user } = useContext(AuthContext);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/jobs/my-applications", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();
        setAppliedJobs(data);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <RippleBackground>
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">My Applications</h2>

      {appliedJobs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">You haven't applied for any jobs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((job) => (
            <JobCard key={job._id} job={job} userId={user.id} />
          ))}
        </div>
      )}
    </div>
     </RippleBackground>
  );
};

export default MyApplicationsPage;

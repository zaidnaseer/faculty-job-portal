import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ResumeEditor from "../components/ResumeEditor";

const ResumePage = () => {
  const { user } = useContext(AuthContext); // Get user data from context
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook to navigate to another page

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user?.id) {
          console.log("No token or user ID found");
          return;
        }
        console.log("User ID:", user.id); // Log the user ID for debugging
        const response = await fetch(`http://localhost:5000/api/faculty/${user.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Faculty data:", data);
        setFacultyData(data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFacultyData();
    } else {
      console.log("No user ID available");
    }
  }, [user?.id]);

  // Only redirect if the data is null after it's fetched
  useEffect(() => {
    if (!loading && !facultyData) {
      navigate("/createResume"); // Redirect to createResume if no data found
    }
  }, [facultyData, loading, navigate]);

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {facultyData ? (
        <ResumeEditor initialResume={{ ...facultyData }} userId={user?.id} />
      ) : (
        <p className="text-center text-gray-600">No resume data available.</p>
      )}
    </div>
  );
};

export default ResumePage;

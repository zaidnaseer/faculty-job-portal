import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ResumeEditor from "../components/ResumeEditor";

const ResumePage = () => {
  const { user } = useContext(AuthContext); // Get user data from context
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   
    const fetchFacultyData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !user?.id) {
          console.log("No token or user ID found");
          return;
        }
  
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
  
    if (user?.id) fetchFacultyData();
    else{
     
    }
  }, [user?.id]);

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
       <ResumeEditor initialResume={{ ...facultyData}} userId={user?.id}/>
      ) : (
        <p className="text-center text-gray-600">No resume data available.</p>
      )}
    </div>
  );
};

export default ResumePage;

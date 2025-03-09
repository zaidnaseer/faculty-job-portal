import { useState, useEffect } from 'react';
import ResumeEditor from '../components/ResumeEditor';
import {mockFaculty} from '../data/mockFaculty';

const ResumePage = () => {
  const [facultyData, setFacultyData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading faculty data
    // In a real app, this would be an API call
    setTimeout(() => {
      // Assume we're logged in as the first faculty member
      setFacultyData(mockFaculty[0]);
      setLoading(false);
    }, 800);
  }, []);
  
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
      <ResumeEditor initialResume={facultyData} />
    </div>
  );
};

export default ResumePage;

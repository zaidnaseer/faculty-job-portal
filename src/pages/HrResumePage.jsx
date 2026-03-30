import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RippleBackground from '../components/RippleBackground';
import EditableResume from '../components/EditableResume';

const HrResumePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyIdFromState = location.state?.facultyId;
  const facultyIdFromQuery = new URLSearchParams(location.search).get('facultyId');
  const facultyId = facultyIdFromState || facultyIdFromQuery;
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      if (!facultyId) {
        if (isMounted) {
          setError('No faculty selected. Please open a resume from the applicants list.');
          setLoading(false);
        }
        return;
      }

      if (!user?.token) {
        if (isMounted) {
          setError('Your session has expired. Please log in again.');
          setLoading(false);
        }
        return;
      }

      if (!backendUrl) {
        if (isMounted) {
          setError('Backend URL is not configured.');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${backendUrl}/api/resume/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          let message = 'Failed to load resume.';
          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {
            // Ignore JSON parsing errors for non-JSON error responses.
          }
          throw new Error(message);
        }

        const data = await response.json();
        if (isMounted) {
          setResume(data);
        }
      } catch (err) {
        console.error("Error fetching resume:", err);
        if (isMounted) {
          setError(err.message || 'Failed to load resume.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [facultyId, user?.token, backendUrl]);

  if (loading) {
    return <p className="text-center">Loading resume...</p>;
  }

  if (error) {
    return (
      <RippleBackground>
        <div className="card p-6 max-w-3xl mx-auto m-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
          >
            Go Back
          </button>
          <p className="mt-4 text-red-600">{error}</p>
        </div>
      </RippleBackground>
    );
  }

  if (!resume) {
    return <p className="text-center">Resume not found.</p>;
  }

  return (
    <RippleBackground>
      <div className="container py-8">
        <EditableResume
          resume={resume}
          setResume={setResume}
          isEditing={false}
          setIsEditing={() => { }}
          onSave={() => { }}
          canEdit={false}
          pageTitle="Applicant Resume"
          showBackButton
          onBack={() => navigate(-1)}
        />
      </div>
    </RippleBackground>
  );
};

export default HrResumePage;

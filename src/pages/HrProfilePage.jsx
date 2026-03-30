import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RippleBackground from '../components/RippleBackground';
import EditableProfile from '../components/EditableProfile';

const HrProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyIdFromState = location.state?.facultyId;
  const facultyIdFromQuery = new URLSearchParams(location.search).get('facultyId');
  const facultyId = facultyIdFromState || facultyIdFromQuery;
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!facultyId) {
        if (isMounted) {
          setError('No faculty selected. Please open a profile from the applicants list.');
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

        const response = await fetch(`${backendUrl}/api/profile/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          let message = 'Failed to load profile.';
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
          setProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (isMounted) {
          setError(err.message || 'Failed to load profile.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [facultyId, user?.token, backendUrl]);

  if (loading) {
    return <p className="text-center">Loading profile...</p>;
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

  if (!profile) {
    return <p className="text-center">Profile not found.</p>;
  }

  return (
    <RippleBackground>
      <div className="container py-8">
        <EditableProfile
          profile={profile}
          setProfile={setProfile}
          isEditing={false}
          setIsEditing={() => { }}
          onSave={() => { }}
          canEdit={false}
          pageTitle="Applicant Profile"
          showBackButton
          onBack={() => navigate(-1)}
        />
      </div>
    </RippleBackground>
  );
};

export default HrProfilePage;

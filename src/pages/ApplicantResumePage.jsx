import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import EditableResume from "../components/EditableResume";
import RippleBackground from "../components/RippleBackground";

const normalizeResume = (data) => ({
  ...data,
  education: Array.isArray(data?.education) ? data.education : [],
  experience: Array.isArray(data?.experience) ? data.experience : [],
  skills: Array.isArray(data?.skills) ? data.skills : [],
  publications: Array.isArray(data?.publications) ? data.publications : [],
});

const cloneResume = (data) => JSON.parse(JSON.stringify(data));

const ApplicantResumePage = () => {
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const facultyIdFromState = location.state?.facultyId;
  const facultyIdFromQuery = new URLSearchParams(location.search).get("facultyId");
  const facultyId = facultyIdFromState || facultyIdFromQuery;
  const isHrFlow = user?.role === "hr";

  const [resume, setResume] = useState(null);
  const [originalResume, setOriginalResume] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      setLoading(true);
      setError("");

      try {
        if (!backendUrl) {
          throw new Error("Backend URL is not configured.");
        }

        if (!user) {
          throw new Error("Your session has expired. Please log in again.");
        }

        let response;

        if (isHrFlow) {
          if (!facultyId) {
            throw new Error("No faculty selected. Please open a resume from the applicants list.");
          }

          response = await fetch(`${backendUrl}/api/resume/${facultyId}`, {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          });
        } else {
          const token = localStorage.getItem("token");
          if (!token || !user?.id) {
            throw new Error("No token or user ID found.");
          }

          response = await fetch(`${backendUrl}/api/faculty/${user.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        }

        if (!response.ok) {
          if (!isHrFlow && response.status === 404) {
            navigate("/add-resume");
            return;
          }

          let message = "Failed to load resume.";
          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {
            // Ignore non-JSON error response bodies.
          }

          throw new Error(message);
        }

        const data = await response.json();
        const normalized = normalizeResume(data);

        if (isMounted) {
          setResume(normalized);
          setOriginalResume(cloneResume(normalized));
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Failed to load resume.");
          setResume(null);
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
  }, [backendUrl, facultyId, isHrFlow, navigate, user]);

  const handleCancel = () => {
    if (originalResume) {
      setResume(cloneResume(originalResume));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (isHrFlow || !resume?._id) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(`${backendUrl}/api/faculty/update/${resume._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resume),
      });

      if (!response.ok) {
        let message = "Update failed.";
        try {
          const errorData = await response.json();
          message = errorData.message || message;
        } catch {
          // Ignore non-JSON error response bodies.
        }
        throw new Error(message);
      }

      const updated = await response.json();
      const normalized = normalizeResume(updated);
      setResume(normalized);
      setOriginalResume(cloneResume(normalized));
      setIsEditing(false);
      alert("Resume updated successfully");
    } catch (saveError) {
      alert(saveError.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resume...</p>
        </div>
      </div>
    );
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
          isEditing={isEditing}
          setIsEditing={(nextValue) => {
            if (!nextValue) {
              handleCancel();
              return;
            }
            setIsEditing(true);
          }}
          onSave={handleSave}
          canEdit={!isHrFlow}
          pageTitle={isHrFlow ? "Applicant Resume" : "About"}
          showBackButton={isHrFlow}
          onBack={() => navigate(-1)}
        />
      </div>
    </RippleBackground>
  );
};

export default ApplicantResumePage;

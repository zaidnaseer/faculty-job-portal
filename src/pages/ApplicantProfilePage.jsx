import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import EditableProfile from "../components/EditableProfile";
import RippleBackground from "../components/RippleBackground";

const normalizeProfile = (data) => ({
  ...data,
  education: Array.isArray(data?.education) ? data.education : [],
  experience: Array.isArray(data?.experience) ? data.experience : [],
  skills: Array.isArray(data?.skills) ? data.skills : [],
  publications: Array.isArray(data?.publications) ? data.publications : [],
});

const cloneProfile = (data) => JSON.parse(JSON.stringify(data));

const ApplicantProfilePage = () => {
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const location = useLocation();
  const navigate = useNavigate();

  const facultyIdFromState = location.state?.facultyId;
  const facultyIdFromQuery = new URLSearchParams(location.search).get("facultyId");
  const facultyId = facultyIdFromState || facultyIdFromQuery;
  const isHrFlow = user?.role === "hr";

  const [profile, setProfile] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeName, setResumeName] = useState("resume.pdf");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
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
            throw new Error("No faculty selected. Please open a profile from the applicants list.");
          }

          response = await fetch(`${backendUrl}/api/profile/${facultyId}`, {
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
            navigate("/add-profile");
            return;
          }

          let message = "Failed to load profile.";
          try {
            const errorData = await response.json();
            message = errorData.message || message;
          } catch {
            // Ignore non-JSON error response bodies.
          }

          throw new Error(message);
        }

        const data = await response.json();
        const normalized = normalizeProfile(data);

        if (isMounted) {
          setProfile(normalized);
          setOriginalProfile(cloneProfile(normalized));
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError.message || "Failed to load profile.");
          setProfile(null);
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
  }, [backendUrl, facultyId, isHrFlow, navigate, user]);

  useEffect(() => {
    let isMounted = true;

    const fetchResume = async () => {
      if (!backendUrl || !profile?._id) {
        if (isMounted) {
          setResumeUrl("");
          setResumeName("resume.pdf");
        }
        return;
      }

      try {
        const token = localStorage.getItem("token") || user?.token;
        const response = await fetch(`${backendUrl}/api/faculty/resume/${profile._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            if (isMounted) {
              setResumeUrl("");
              setResumeName("resume.pdf");
            }
            return;
          }
          throw new Error("Resume not available.");
        }

        const data = await response.json();
        if (isMounted) {
          setResumeUrl(data.url || "");
          setResumeName(data.filename || profile?.resumeFile?.filename || "resume.pdf");
        }
      } catch (fetchError) {
        if (isMounted) {
          setResumeUrl("");
          setResumeName("resume.pdf");
        }
      }
    };

    fetchResume();

    return () => {
      isMounted = false;
    };
  }, [backendUrl, profile?._id, user?.token]);

  const refreshResumeUrl = async () => {
    const token = localStorage.getItem("token") || user?.token;
    if (!backendUrl || !profile?._id || !token) {
      return null;
    }

    const response = await fetch(`${backendUrl}/api/faculty/resume/${profile._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Resume is no longer available. Please try again.");
    }

    const data = await response.json();
    setResumeUrl(data.url || "");
    setResumeName(data.filename || profile?.resumeFile?.filename || "resume.pdf");
    return data;
  };

  const deleteResume = async () => {
    const token = localStorage.getItem("token") || user?.token;
    if (!backendUrl || !profile?._id || !token) {
      throw new Error("Session expired. Please log in again.");
    }

    const response = await fetch(`${backendUrl}/api/faculty/resume/${profile._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to delete resume.");
    }

    setResumeUrl("");
    setResumeName("resume.pdf");
    setProfile((prev) => ({ ...prev, resumeFile: undefined }));
  };

  const handleCancel = () => {
    if (originalProfile) {
      setProfile(cloneProfile(originalProfile));
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (isHrFlow || !profile?._id) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      const response = await fetch(`${backendUrl}/api/faculty/update/${profile._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
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
      const normalized = normalizeProfile(updated);
      setProfile(normalized);
      setOriginalProfile(cloneProfile(normalized));
      setIsEditing(false);
      alert("Profile updated successfully");
    } catch (saveError) {
      alert(saveError.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
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

  if (!profile) {
    return <p className="text-center">Profile not found.</p>;
  }

  return (
    <RippleBackground>
      <div className="container py-8">
        <EditableProfile
          profile={profile}
          setProfile={setProfile}
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
          pageTitle={isHrFlow ? "Applicant Profile" : "About"}
          showBackButton={isHrFlow}
          onBack={() => navigate(-1)}
          resumeUrl={resumeUrl}
          resumeName={resumeName}
          onRefreshResume={refreshResumeUrl}
          onDeleteResume={deleteResume}
        />
      </div>
    </RippleBackground>
  );
};

export default ApplicantProfilePage;

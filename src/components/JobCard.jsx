import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegBookmark,
  FaBookmark,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";

const JobCard = ({
  job,
  userId,
  backendUrl,
  authToken,
  showWithdraw = false,
  onWithdraw,
  isWithdrawing = false,
  showApplyAction = true,
  applicationStatus,
  reapplyEligibleAt,
  onApplySuccess
}) => {
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (applicationStatus === "active") {
      setApplied(true);
      return;
    }

    if (!userId) {
      return;
    }

    const statusFromJob = job?.applications?.find(
      (entry) => entry.user?._id?.toString?.() === userId?.toString?.()
    )?.status;

    if (statusFromJob === "active") {
      setApplied(true);
    }
  }, [job?.applications, userId, applicationStatus]);

  const toggleSave = () => {
    setSaved(!saved);
  };

  const getHumanReadableDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("default", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysUntilReapply = () => {
    if (!reapplyEligibleAt) {
      return 0;
    }

    const eligibleDate = new Date(reapplyEligibleAt);
    if (Number.isNaN(eligibleDate.getTime())) {
      return 0;
    }

    const diffMs = eligibleDate.getTime() - Date.now();
    if (diffMs <= 0) {
      return 0;
    }

    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysUntilReapply = getDaysUntilReapply();
  const isArchivedStatus = applicationStatus === "withdrawn" || applicationStatus === "rejected";
  const shouldShowCooldownState = isArchivedStatus && daysUntilReapply > 0;

  const applyForJob = async (jobId) => {
    try {
      const apiBaseUrl = backendUrl || import.meta.env.VITE_BACKEND_URL;
      const token = authToken || localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/api/jobs/apply/${jobId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setApplied(true);
        onApplySuccess?.(jobId);
        alert("Successfully applied for the job");
      } else {
        alert(data.message || "Failed to apply for job");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  const handleApplyClick = async () => {
    try {
      const profileResponse = await fetch(`/api/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (profileResponse.status === 404) {
        setShowProfileModal(true);
        return;
      }

      if (!profileResponse.ok) {
        const data = await profileResponse.json().catch(() => ({}));
        alert(data.message || "Could not verify profile. Please try again.");
        return;
      }

      applyForJob(job._id);
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="card h-full flex flex-col">
        {/* University name */}
        <div className="bg-blue-900 text-white text-lg font-semibold px-4 py-2 mb-4 text-center tracking-wide uppercase rounded-t">
          {job.institution}
        </div>
        {/* Job title and save icon */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{job.title}</h3>
            <p className="text-gray-600">{job.department}</p>
          </div>
          <button onClick={toggleSave} className="text-gray-400 hover:text-primary">
            {saved ? <FaBookmark className="text-primary" /> : <FaRegBookmark />}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {applicationStatus && (
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold ${applicationStatus === "withdrawn"
                ? "bg-amber-100 text-amber-700"
                : applicationStatus === "rejected"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-emerald-100 text-emerald-700"
                }`}
            >
              {applicationStatus === "withdrawn"
                ? "Withdrawn"
                : applicationStatus === "rejected"
                  ? "Not Selected"
                  : "Active"}
            </span>
          )}
        </div>
        {/* Job info */}
        <div className="mt-4 space-y-2 text-sm text-gray-500">
          <div className="flex items-center">
            <FaBriefcase className="mr-2" />
            <span>{job.type}</span>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="mr-2" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="mr-2" />
            <span>Posted: {getHumanReadableDate(job.postedDate)}</span>
          </div>
        </div>

        {/* Job description */}
        <div className="mt-4 line-clamp-2 text-sm">{job.description}</div>

        {/* Skills and apply button */}
        <div className="mt-auto pt-4">
          {Array.isArray(job.skills) && job.skills.length > 0 && (
            <div className="flex gap-2 text-sm">
              {job.skills.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {job.skills.length > 3 && (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  +{job.skills.length - 3} more
                </span>
              )}
            </div>
          )}

          {showWithdraw ? (
            <div className="mt-4">
              <button
                onClick={() => onWithdraw?.(job._id)}
                disabled={isWithdrawing}
                className="btn w-full border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white disabled:border-red-300 disabled:text-red-300 disabled:hover:bg-transparent"
              >
                {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
              </button>
            </div>
          ) : showApplyAction ? (
            <div className="mt-4">
              {applied ? (
                <button disabled className="btn btn-outline w-full opacity-75">
                  Applied
                </button>
              ) : shouldShowCooldownState ? (
                <p className="text-sm font-medium text-amber-700 text-center">
                  Apply after {daysUntilReapply} day{daysUntilReapply === 1 ? "" : "s"}
                </p>
              ) : (
                <button onClick={handleApplyClick} className="btn btn-primary w-full">
                  Apply
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Profile Required</h3>
            <p className="text-gray-600 mb-6">
              You cannot apply to a job without creating a profile.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProfileModal(false);
                  navigate("/profile");
                }}
                className="btn btn-primary"
              >
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobCard;

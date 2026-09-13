import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaRegBookmark,
  FaBookmark,
  FaBriefcase,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { formatFullDate } from "../utils/dateFormatting";

const JobCard = ({
  job,
  userId,
  backendUrl,
  authToken,
  showWithdraw = false,
  onWithdraw,
  isWithdrawing = false,
  showApplyAction = true,
  disableApplyAction = false,
  applicationStatus,
  reapplyEligibleAt,
  onApplySuccess,
  onSelect,
  isSelected = false,
  detailView = false,
  listView = false,
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
  const isNoLongerAcceptingApplications = job?.status && job.status !== "Active";

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

  const applicationAction = (
    <div className={detailView ? "pt-5" : "mt-auto pt-6"}>
      {applicationStatus && (
        <div className="mb-3">
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
        </div>
      )}

      {isNoLongerAcceptingApplications && (
        <p className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
          This job is no longer taking new applications{applicationStatus === "active" ? ". Your application is still active" : ""}.
        </p>
      )}

      {showWithdraw ? (
        <button
          onClick={() => onWithdraw?.(job._id)}
          disabled={isWithdrawing}
          className={`btn border border-red-600 bg-transparent text-red-600 hover:bg-red-600 hover:text-white disabled:border-red-300 disabled:text-red-300 disabled:hover:bg-transparent ${detailView ? "w-auto" : "w-full"}`}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
        </button>
      ) : showApplyAction ? (
        applied ? (
          <button disabled className={`btn btn-outline opacity-75 ${detailView ? "w-auto" : "w-full"}`}>
            Applied
          </button>
        ) : disableApplyAction ? (
          <button disabled className={`btn btn-outline cursor-not-allowed opacity-60 ${detailView ? "w-auto" : "w-full"}`}>
            Applications Closed
          </button>
        ) : shouldShowCooldownState ? (
          <p className="text-center text-sm font-medium text-amber-700">
            Apply after {daysUntilReapply} day{daysUntilReapply === 1 ? "" : "s"}
          </p>
        ) : (
          <button onClick={handleApplyClick} className={`btn btn-primary ${detailView ? "w-auto" : "w-full"}`}>
            Apply
          </button>
        )
      ) : null}
    </div>
  );

  return (
    <>
      <div
        className={`flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition duration-200 ${detailView
          ? "border-slate-200 shadow-md"
          : `cursor-pointer hover:-translate-y-1 hover:shadow-lg ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-slate-200"}`
          }`}
        onClick={() => onSelect?.(job)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect?.(job);
          }
        }}
        role={onSelect ? "button" : undefined}
        tabIndex={onSelect ? 0 : undefined}
      >
        <div className={`flex flex-1 flex-col ${listView ? "p-4" : "p-5"}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="truncate pt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {job.institution || "Institution"}
            </p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                toggleSave();
              }}
              aria-label={saved ? "Remove saved job" : "Save job"}
              className="-mr-2 -mt-2 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-primary"
            >
              {saved ? <FaBookmark className="text-primary" /> : <FaRegBookmark />}
            </button>
          </div>

          <div>
            <h3 className="mt-2 text-xl font-bold leading-tight text-slate-900">{job.title}</h3>
            {job.department && (
              <p className="mt-2 text-sm font-medium text-blue-700">{job.department}</p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <FaBriefcase className="text-slate-400" />
              {job.type}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <FaMapMarkerAlt className="text-slate-400" />
              {job.location}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <FaCalendarAlt />
            <span>Posted {formatFullDate(job.postedDate, "Date unavailable")}</span>
          </div>

          {detailView && applicationAction}

          <div className={`mt-4 text-sm leading-6 text-slate-600 ${detailView ? "whitespace-pre-line" : listView ? "line-clamp-2" : "line-clamp-3"}`}>
            {job.description}
          </div>

          {!detailView && applicationAction}
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

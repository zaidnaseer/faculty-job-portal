import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RippleBackground from "../components/RippleBackground";
import defaultProfileImage from "../../assets/default-profile.jpg";
import { Copy, Pencil, RotateCcw, Sparkles, Trash2, UserRound, X } from "lucide-react";
import { getJobStatusClasses, getRelativeAge } from "../utils/jobDisplay";

const JobApplicantsPage = () => {
    const { jobId } = useParams();
    const { user } = useContext(AuthContext);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [applicantsByStatus, setApplicantsByStatus] = useState({
        active: [],
        rejected: [],
        withdrawn: []
    });
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const [shortlistingId, setShortlistingId] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState("active");
    const [retentionMonths, setRetentionMonths] = useState(12);
    const hasFetchedApplicants = useRef(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (hasFetchedApplicants.current) return;
        hasFetchedApplicants.current = true;

        const fetchApplicants = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/jobs/${jobId}/applicants`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch applicants");
                const data = await response.json();
                if (data.applicantsByStatus) {
                    setApplicantsByStatus({
                        active: data.applicantsByStatus.active || [],
                        rejected: data.applicantsByStatus.rejected || [],
                        withdrawn: data.applicantsByStatus.withdrawn || [],
                    });
                } else {
                    setApplicantsByStatus({
                        active: data.applicants || [],
                        rejected: [],
                        withdrawn: [],
                    });
                }
                if (typeof data.retentionMonths === "number") {
                    setRetentionMonths(data.retentionMonths);
                }
                if (data.job) setJob(data.job);

                fetch(`${backendUrl}/api/jobs/${jobId}/applicants/visit`, {
                    method: "POST",
                    headers: { Authorization: `Bearer ${user.token}` },
                }).catch((error) => console.error("Failed to record applicant list visit:", error));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchApplicants();
    }, [jobId, user, backendUrl]);

    const handleRejectApplicant = async (applicantId) => {
        if (!window.confirm("Reject this applicant?")) return;

        setRejectingId(applicantId);
        try {
            const response = await fetch(
                `${backendUrl}/api/jobs/${jobId}/applicants/${applicantId}/reject`,
                {
                    method: "PATCH",
                    headers: { Authorization: `Bearer ${user.token}` },
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "Failed to reject applicant");
                return;
            }

            setApplicantsByStatus((prev) => {
                const nextActive = (prev.active || []).filter(
                    (faculty) => faculty._id !== applicantId
                );
                const rejectedSet = new Set((prev.rejected || []).map((entry) => entry._id));
                const rejectedCandidate = (prev.active || []).find(
                    (faculty) => faculty._id === applicantId
                );
                const nextRejected = rejectedCandidate && !rejectedSet.has(applicantId)
                    ? [...(prev.rejected || []), rejectedCandidate]
                    : prev.rejected || [];

                return {
                    ...prev,
                    active: nextActive,
                    rejected: nextRejected,
                };
            });
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setRejectingId(null);
        }
    };

    const handleToggleShortlist = async (applicantId, nextShortlisted) => {
        setShortlistingId(applicantId);
        try {
            const response = await fetch(
                `${backendUrl}/api/jobs/${jobId}/applicants/${applicantId}/shortlist`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ shortlisted: nextShortlisted }),
                }
            );

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                alert(data.message || "Failed to update shortlist status");
                return;
            }

            setApplicantsByStatus((prev) => ({
                ...prev,
                active: (prev.active || []).map((faculty) =>
                    faculty._id === applicantId
                        ? { ...faculty, shortlisted: nextShortlisted }
                        : faculty
                ),
            }));
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setShortlistingId(null);
        }
    };

    const handleStatusChange = async () => {
        if (!job) return;
        const nextStatus = job.status === "Closed" ? "Active" : "Closed";
        setStatusUpdating(true);
        try {
            const response = await fetch(`${backendUrl}/api/jobs/${job._id}/status`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ status: nextStatus }),
            });

            if (!response.ok) throw new Error("Failed to update job status");
            const updatedJob = await response.json();
            setJob(updatedJob);
        } catch (error) {
            alert("Failed to update job status. Please try again.");
        } finally {
            setStatusUpdating(false);
        }
    };

    const handlePermanentDelete = async () => {
        if (!job) return;
        if (!window.confirm("Permanently delete this stopped job and all of its application data? This cannot be undone.")) return;

        setDeleting(true);
        try {
            const response = await fetch(`${backendUrl}/api/jobs/${job._id}/permanent`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` },
            });

            if (!response.ok) throw new Error("Failed to permanently delete job");
            navigate("/hr");
        } catch (error) {
            alert("Failed to permanently delete job. Please try again.");
        } finally {
            setDeleting(false);
        }
    };

    const shortlistedApplicants = (applicantsByStatus.active || []).filter(
        (faculty) => faculty.shortlisted
    );
    const pendingApplicants = (applicantsByStatus.active || []).filter(
        (faculty) => !faculty.shortlisted
    );
    const tabLabels = {
        active: "Pending",
        shortlisted: "Shortlisted",
        rejected: "Rejected",
        withdrawn: "Withdrawn",
    };
    const tabCounts = {
        active: pendingApplicants.length,
        shortlisted: shortlistedApplicants.length,
        rejected: (applicantsByStatus.rejected || []).length,
        withdrawn: (applicantsByStatus.withdrawn || []).length,
    };
    const currentApplicants =
        activeTab === "shortlisted"
            ? shortlistedApplicants
            : activeTab === "active"
                ? pendingApplicants
                : applicantsByStatus[activeTab] || [];
    const sortedApplicants = [...currentApplicants].sort(
        (left, right) => Number(right.isNew) - Number(left.isNew)
    );
    const emptyMessage =
        activeTab === "active"
            ? "No pending applicants for this job yet."
            : activeTab === "shortlisted"
                ? "No shortlisted applicants yet."
                : activeTab === "rejected"
                    ? "No rejected applicants to show."
                    : "No withdrawn applications to show.";

    return (
        <RippleBackground>
            <div className="container py-8">
                <button
                    className="btn-back mb-6"
                    onClick={() => navigate("/hr")}
                >
                    ← Back
                </button>
                {job && (
                    <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="truncate text-2xl font-bold text-slate-900" title={job.title || "Untitled"}>
                                        {job.title || "Untitled"}
                                    </h2>
                                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getJobStatusClasses(job.status || "Active")}`}>
                                        {job.status || "Active"}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-500">
                                    {[job.department, job.location, job.type].filter(Boolean).join(" · ")}
                                    {(job.department || job.location || job.type) && " · "}
                                    Posted {getRelativeAge(job.postedDate)}
                                </p>
                                <div className="mt-4 flex items-center gap-5 text-sm">
                                    <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                        <UserRound size={17} className="text-blue-600" />
                                        {applicantsByStatus.active?.length || 0} Applicant{(applicantsByStatus.active?.length || 0) === 1 ? "" : "s"}
                                    </span>
                                    <span className="inline-flex items-center gap-2 font-semibold text-slate-700">
                                        <Sparkles size={16} className="text-emerald-500" />
                                        {shortlistedApplicants.length} Shortlisted
                                    </span>
                                </div>
                            </div>
                            <div className="flex shrink-0 flex-wrap gap-2">
                                <button
                                    onClick={() => navigate("/create-job", { state: { job, mode: "edit" } })}
                                    disabled={job.status === "Deleted"}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Pencil size={15} /> Edit Posting
                                </button>
                                <button
                                    onClick={() => navigate("/create-job", { state: { job: { ...job, _id: undefined }, mode: "duplicate" } })}
                                    disabled={job.status === "Deleted"}
                                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Copy size={15} /> Duplicate
                                </button>
                                {job.status === "Closed" && (
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={statusUpdating}
                                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                        <RotateCcw size={15} /> {statusUpdating ? "Updating..." : "Resume Hiring"}
                                    </button>
                                )}
                                {job.status === "Active" && (
                                    <button
                                        onClick={handleStatusChange}
                                        disabled={statusUpdating}
                                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                                    >
                                        <X size={15} /> {statusUpdating ? "Updating..." : "Stop Hiring"}
                                    </button>
                                )}
                                {job.status === "Closed" && (
                                    <button
                                        onClick={handlePermanentDelete}
                                        disabled={deleting}
                                        className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                                    >
                                        <Trash2 size={15} /> {deleting ? "Deleting..." : "Delete Permanently"}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="mb-6 flex flex-wrap items-center gap-4">
                    <div className="flex flex-wrap gap-2 rounded-full bg-blue-100 p-1.5 ring-1 ring-inset ring-blue-300">
                        {["active", "shortlisted"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab
                                    ? "bg-blue-600 text-white shadow"
                                    : "text-blue-900 hover:bg-white"
                                    }`}
                            >
                                {tabLabels[tab]}
                                <span className="ml-2 text-xs font-normal">
                                    ({tabCounts[tab]})
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-gray-300" />
                    <div className="flex flex-wrap gap-2 rounded-full bg-gray-100 p-1.5 ring-1 ring-inset ring-gray-300">
                        {["rejected", "withdrawn"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${activeTab === tab
                                    ? "bg-gray-600 text-white shadow"
                                    : "text-gray-700 hover:bg-white"
                                    }`}
                            >
                                {tabLabels[tab]}
                                <span className="ml-2 text-xs font-normal">
                                    ({tabCounts[tab]})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                {(activeTab === "rejected" || activeTab === "withdrawn") && (
                    <p className="mb-4 text-xs text-gray-500">
                        Showing applications {activeTab} within the last {retentionMonths} months.
                    </p>
                )}
                {loading ? (
                    <p className="text-gray-500">Loading applicants...</p>
                ) : currentApplicants.length === 0 ? (
                    <p className="text-gray-400">{emptyMessage}</p>
                ) : (
                    <ul className="divide-y divide-gray-100 bg-white rounded-xl shadow p-6">
                        {sortedApplicants.map((faculty) => (
                            <li key={faculty._id} className="flex items-center py-3">
                                <img
                                    src={faculty.profileImage || defaultProfileImage}
                                    alt={faculty.name || "Applicant"}
                                    className="mr-4 h-10 w-10 rounded-full object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 font-medium text-gray-800">
                                        {faculty.name}
                                        {faculty.isNew && (
                                            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 ring-1 ring-inset ring-blue-200">
                                                New
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-gray-500 text-xs">{faculty.email}</div>
                                </div>
                                <div className="ml-4 flex items-center gap-2">
                                    <button
                                        onClick={() =>
                                            navigate(`/display-profile?facultyId=${faculty._id}&jobId=${jobId}`, {
                                                state: { facultyId: faculty._id, jobId },
                                            })
                                        }
                                        className="inline-flex items-center rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 active:bg-blue-600 active:text-white"
                                    >
                                        View Profile
                                    </button>
                                    {(activeTab === "active" || activeTab === "shortlisted") && (
                                        <button
                                            onClick={() => handleToggleShortlist(faculty._id, !faculty.shortlisted)}
                                            disabled={shortlistingId === faculty._id}
                                            className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${faculty.shortlisted
                                                ? "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                                                : "border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 active:bg-emerald-600 active:text-white"
                                                }`}
                                        >
                                            {shortlistingId === faculty._id
                                                ? "Updating..."
                                                : faculty.shortlisted
                                                    ? "Unshortlist"
                                                    : "Shortlist"}
                                        </button>
                                    )}
                                    {(activeTab === "active" || activeTab === "shortlisted") && (
                                        <button
                                            onClick={() => handleRejectApplicant(faculty._id)}
                                            disabled={rejectingId === faculty._id}
                                            className="inline-flex items-center rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 disabled:opacity-50"
                                        >
                                            {rejectingId === faculty._id ? "Rejecting..." : "Reject"}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </RippleBackground>
    );
};

export default JobApplicantsPage;

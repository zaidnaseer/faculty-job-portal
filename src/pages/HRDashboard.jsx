import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, MoreVertical, Pencil, Plus, RotateCcw, Sparkles, Trash2, UserRound, X } from "lucide-react";
import RippleBackground from "../components/RippleBackground";

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, backendUrl]);

  useEffect(() => {
    if (!openMenuId) return undefined;

    const handleOutsideClick = (event) => {
      if (!event.target.closest("[data-job-menu]")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  const handlePermanentDelete = async (jobId) => {
    if (!window.confirm("Permanently delete this stopped job and all of its application data? This cannot be undone.")) return;

    try {
      const response = await fetch(`${backendUrl}/api/jobs/${jobId}/permanent`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
        setOpenMenuId(null);
      } else {
        console.error("Failed to permanently delete job");
      }
    } catch (error) {
      console.error("Error permanently deleting job:", error);
    }
  };

  const handleStatusChange = async (job) => {
    const nextStatus = job.status === "Closed" ? "Active" : "Closed";

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
      setJobs((prevJobs) => prevJobs.map((entry) => entry._id === job._id ? updatedJob : entry));
      setOpenMenuId(null);
    } catch (error) {
      console.error("Error updating job status:", error);
    }
  };

  const getRelativeAge = (date) => {
    const postedAt = new Date(date).getTime();
    if (!date || Number.isNaN(postedAt)) return "recently";

    const days = Math.max(0, Math.floor((Date.now() - postedAt) / 86400000));
    if (days === 0) return "today";
    if (days === 1) return "yesterday";
    if (days < 30) return `${days} days ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? "" : "s"} ago`;
  };

  const getStatusClasses = (status) => ({
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Draft: "bg-amber-50 text-amber-700 ring-amber-200",
    Closed: "bg-slate-100 text-slate-600 ring-slate-200",
    Deleted: "bg-rose-50 text-rose-700 ring-rose-200",
  }[status] || "bg-emerald-50 text-emerald-700 ring-emerald-200");

  if (loading) {
    return <p className="text-center text-gray-600">Loading jobs...</p>;
  }

  return (
    <RippleBackground>
      <div className="container py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Hiring workspace</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">Your job postings</h2>
            <p className="mt-2 text-sm text-slate-500">Monitor applications and keep every posting up to date.</p>
          </div>
          <button onClick={() => navigate("/create-job")} className="btn btn-primary inline-flex items-center justify-center gap-2">
            <Plus size={17} /> New posting
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="flex flex-col items-center mt-16">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">No jobs posted yet. Start by posting a new job!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className={`group flex min-h-[224px] flex-col rounded-2xl border p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.1)] ${job.status === "Draft" ? "border-amber-200 bg-amber-50/50" : job.status === "Closed" ? "border-slate-300 bg-slate-100/80 ring-1 ring-slate-200/80" : "border-slate-200/80 bg-white"}`}
              >
                <div className="relative flex items-start justify-between gap-3">
                  <h3 className="min-w-0 truncate text-lg font-bold text-slate-900" title={job.title || "Untitled draft"}>{job.title || "Untitled draft"}</h3>
                  <div data-job-menu className="relative flex shrink-0 items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getStatusClasses(job.status || "Active")}`}>
                      {job.status || "Active"}
                    </span>
                    <button
                      onClick={() => setOpenMenuId(openMenuId === job._id ? null : job._id)}
                      className={`rounded-lg p-1.5 transition ${job.status === "Closed" ? "text-slate-500 hover:bg-slate-200 hover:text-slate-800" : job.status === "Draft" ? "text-amber-600 hover:bg-amber-100 hover:text-amber-800" : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                      aria-label={`Actions for ${job.title}`}
                      aria-expanded={openMenuId === job._id}
                    >
                      <MoreVertical size={19} />
                    </button>
                    {openMenuId === job._id && (
                      <div className="absolute right-0 top-9 z-10 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                        <button onClick={() => navigate("/create-job", { state: { job, mode: "edit" } })} disabled={job.status === "Deleted"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Pencil size={15} /> Edit Posting</button>
                        {job.status === "Closed" && (
                          <button onClick={() => handleStatusChange(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"><RotateCcw size={15} /> Resume Hiring</button>
                        )}
                        <button onClick={() => navigate("/create-job", { state: { job: { ...job, _id: undefined }, mode: "duplicate" } })} disabled={job.status === "Deleted"} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Copy size={15} /> Duplicate</button>
                        <button disabled className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-400"><ArrowRight size={15} /> Share</button>
                        {job.status === "Active" && (
                          <button onClick={() => handleStatusChange(job)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"><X size={15} /> Stop Hiring</button>
                        )}
                        {job.status === "Closed" && (
                          <button onClick={() => handlePermanentDelete(job._id)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"><Trash2 size={15} /> Delete Permanently</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {job.status === "Draft" ? (
                  (job.location || job.type) && (
                    <p className="mt-2 text-sm text-slate-500">
                      {[job.location, job.type].filter(Boolean).join(" · ")}
                    </p>
                  )
                ) : (
                  <p className="mt-2 text-sm text-slate-500">{job.location} <span className="px-1 text-slate-300">·</span> {job.type} <span className="px-1 text-slate-300">·</span> Posted {getRelativeAge(job.postedDate)}</p>
                )}
                {job.status === "Draft" ? (
                  <div className="mt-7 rounded-xl border border-amber-200 bg-white/70 px-3 py-2 text-sm text-amber-800">
                    Private draft · Visible only to you
                  </div>
                ) : (
                  <div className="mt-7 flex items-center gap-5 text-sm">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-700"><UserRound size={17} className="text-blue-600" /> {job.applications?.filter((entry) => entry.status === "active").length || 0} Applicants</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-700"><Sparkles size={16} className="text-emerald-500" /> {job.newApplicants || 0} New</span>
                  </div>
                )}
                <button onClick={() => job.status === "Draft" ? navigate("/create-job", { state: { job, mode: "edit" } }) : navigate(`/job-applicants/${job._id}`)} disabled={job.status === "Deleted"} className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-bold text-blue-700 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-40">{job.status === "Draft" ? "Continue editing" : "Manage"} <ArrowRight size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </RippleBackground>
  );
};

export default HRDashboard;

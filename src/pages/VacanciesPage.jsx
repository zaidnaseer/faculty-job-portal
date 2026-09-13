import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import JobCard from "../components/JobCard";
import { FaSearch, FaFilter, FaArrowLeft, FaThLarge, FaColumns } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import RippleBackground from "../components/RippleBackground";

const VacanciesPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [jobs, setJobs] = useState([]); // All jobs fetched from the server
  const [appliedJobIds, setAppliedJobIds] = useState([]); // Job IDs the user has applied to
  const [applicationStatusByJobId, setApplicationStatusByJobId] = useState({});
  const [reapplyEligibleAtByJobId, setReapplyEligibleAtByJobId] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // Search term for job titles, keywords, etc.
  const [filters, setFilters] = useState({
    type: "all", // Filter for job type
    department: "all", // Filter for department
    location: "all", // Filter for location
    institution: "all", // Filter for institution
  });
  const [showFilters, setShowFilters] = useState(false); // Toggle for showing filters
  const [loading, setLoading] = useState(true); // Loading state for job listings
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedJobRef = useRef(null);
  const vacanciesBrowserRef = useRef(null);

  const selectedJobId = searchParams.get("job");
  const isSplitView = searchParams.get("view") === "split";

  // Fetch jobs and user's applications when the component mounts
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/jobs`);
        const data = await response.json();
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    const fetchApplications = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/jobs/my-applications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setAppliedJobIds(
          data
            .filter((app) => app.applicationStatus === "active")
            .map((app) => app._id)
        );

        const nextStatusByJobId = {};
        const nextEligibleAtByJobId = {};
        data.forEach((app) => {
          nextStatusByJobId[app._id] = app.applicationStatus;
          nextEligibleAtByJobId[app._id] = app.reapplyEligibleAt || null;
        });
        setApplicationStatusByJobId(nextStatusByJobId);
        setReapplyEligibleAtByJobId(nextEligibleAtByJobId);
      } catch (error) {
        console.error("Error fetching applications:", error);
      }
    };

    Promise.all([fetchJobs(), fetchApplications()]).finally(() => setLoading(false));
  }, [user.id, user.token, backendUrl]);

  // Get unique values for filter dropdowns (for department, location, type, institution)
  const departments = ["all", ...new Set(jobs.map((job) => job.department))];
  const locations = ["all", ...new Set(jobs.map((job) => job.location))];
  const jobTypes = ["all", ...new Set(jobs.map((job) => job.type))];
  const institutions = ["all", ...new Set(jobs.map((job) => job.institution).filter(Boolean))];

  // Handle changes in filter selection (job type, department, location, institution)
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter jobs based on search term, filters, and remove jobs already applied to
  const isCooldownBlocked = (jobId) => {
    const status = applicationStatusByJobId[jobId];
    if (status !== "withdrawn" && status !== "rejected") {
      return false;
    }

    const eligibleAt = reapplyEligibleAtByJobId[jobId];
    if (!eligibleAt) {
      return false;
    }

    const eligibleDate = new Date(eligibleAt);
    if (Number.isNaN(eligibleDate.getTime())) {
      return false;
    }

    return eligibleDate.getTime() > Date.now();
  };

  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.institution && job.institution.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = filters.type === "all" || job.type === filters.type;
      const matchesDepartment =
        filters.department === "all" || job.department === filters.department;
      const matchesLocation =
        filters.location === "all" || job.location === filters.location;
      const matchesInstitution =
        filters.institution === "all" || job.institution === filters.institution;

      return matchesSearch && matchesType && matchesDepartment && matchesLocation && matchesInstitution;
    })
    .filter((job) => !appliedJobIds.includes(job._id))
    .filter((job) => !isCooldownBlocked(job._id)); // Hide jobs still in reapply cooldown

  const selectedJob = filteredJobs.find((job) => job._id === selectedJobId);
  const splitView = isSplitView && filteredJobs.length > 0;

  useEffect(() => {
    if (!isSplitView || !filteredJobs.length || selectedJob) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set("job", filteredJobs[0]._id);
    setSearchParams(nextSearchParams, { replace: true });
  }, [filteredJobs, isSplitView, searchParams, selectedJob, setSearchParams]);

  const handleViewChange = (nextSplitView, requestedJobId = selectedJobId) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (nextSplitView) {
      const nextJobId = filteredJobs.some((job) => job._id === requestedJobId)
        ? requestedJobId
        : filteredJobs[0]?._id;

      nextSearchParams.set("view", "split");
      if (nextJobId) {
        nextSearchParams.set("job", nextJobId);
      } else {
        nextSearchParams.delete("job");
      }
    } else {
      nextSearchParams.delete("view");
      nextSearchParams.delete("job");
    }

    setSearchParams(nextSearchParams);
  };

  useEffect(() => {
    if (!splitView || !selectedJobRef.current || !window.matchMedia("(min-width: 1024px)").matches) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const browser = vacanciesBrowserRef.current;
      const selectedCard = selectedJobRef.current;
      if (!browser || !selectedCard) {
        return;
      }

      const browserRect = browser.getBoundingClientRect();
      const selectedCardRect = selectedCard.getBoundingClientRect();
      const topSpacing = Math.max(16, browser.clientHeight * 0.22);
      const nextScrollTop = browser.scrollTop
        + selectedCardRect.top
        - browserRect.top
        - topSpacing;

      browser.scrollTop = Math.max(0, Math.min(
        nextScrollTop,
        browser.scrollHeight - browser.clientHeight,
      ));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedJobId, splitView]);

  const handleApplySuccess = (jobId) => {
    setAppliedJobIds((prev) => Array.from(new Set([...prev, jobId])));
    setApplicationStatusByJobId((prev) => ({ ...prev, [jobId]: "active" }));
    setReapplyEligibleAtByJobId((prev) => ({ ...prev, [jobId]: null }));
  };

  // Show loading spinner while jobs are being fetched
  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RippleBackground>
        <div className="container py-8">
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Search for job titles, keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10 w-full"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-outline md:w-auto flex items-center justify-center gap-2"
              >
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Type
                  </label>
                  <select
                    name="type"
                    value={filters.type}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type === "all" ? "All Types" : type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    name="department"
                    value={filters.department}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {location === "all" ? "All Locations" : location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Institution Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Institution
                  </label>
                  <select
                    name="institution"
                    value={filters.institution}
                    onChange={handleFilterChange}
                    className="form-input"
                  >
                    {institutions.map((institution) => (
                      <option key={institution} value={institution}>
                        {institution === "all" ? "All Institutions" : institution}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Opportunities</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Available Positions</h2>
            </div>
            <div className="inline-flex shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => handleViewChange(false)}
                aria-pressed={!splitView}
                aria-label="Card view"
                title="Card view"
                className={`rounded-md p-2.5 text-sm font-semibold transition-colors ${!splitView
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <FaThLarge aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleViewChange(true)}
                aria-pressed={splitView}
                aria-label="Split view"
                title="Split view"
                className={`rounded-md p-2.5 text-sm font-semibold transition-colors ${splitView
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
                  }`}
              >
                <FaColumns aria-hidden="true" />
              </button>
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className={`vacancies-shell ${splitView ? "is-split" : ""}`}>
              <div ref={vacanciesBrowserRef} className="vacancies-browser">
                <div className="vacancies-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job._id}
                      ref={job._id === selectedJob?._id ? selectedJobRef : null}
                    >
                      <JobCard
                        job={job}
                        userId={user.id}
                        onSelect={() => handleViewChange(true, job._id)}
                        isSelected={job._id === selectedJob?._id}
                        listView={splitView}
                        showApplyAction={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="vacancies-detail-panel">
                {splitView && selectedJob && (
                  <div className="vacancies-detail-content">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="vacancies-mobile-back btn-back mb-6"
                    >
                      ← Back
                    </button>
                    <JobCard
                      job={selectedJob}
                      userId={user.id}
                      backendUrl={backendUrl}
                      authToken={user.token}
                      detailView
                      applicationStatus={applicationStatusByJobId[selectedJob._id]}
                      reapplyEligibleAt={reapplyEligibleAtByJobId[selectedJob._id]}
                      onApplySuccess={handleApplySuccess}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No matching positions found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search terms or filters to find more
                opportunities.
              </p>
            </div>
          )}
        </div>
      </RippleBackground>
    </div>
  );
};

export default VacanciesPage;

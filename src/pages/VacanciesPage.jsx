import { useState, useEffect, useContext } from "react";
import JobCard from "../components/JobCard";
import { FaSearch, FaFilter } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import RippleBackground from "../components/RippleBackground";

const VacanciesPage = () => {
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [jobs, setJobs] = useState([]); // All jobs fetched from the server
  const [appliedJobIds, setAppliedJobIds] = useState([]); // Job IDs the user has applied to
  const [searchTerm, setSearchTerm] = useState(""); // Search term for job titles, keywords, etc.
  const [filters, setFilters] = useState({
    type: "all", // Filter for job type
    department: "all", // Filter for department
    location: "all", // Filter for location
    institution: "all", // Filter for institution
  });
  const [showFilters, setShowFilters] = useState(false); // Toggle for showing filters
  const [loading, setLoading] = useState(true); // Loading state for job listings

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
        setAppliedJobIds(data.map(app => app._id));
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
    .filter((job) => !appliedJobIds.includes(job._id)); // Remove jobs already applied to

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

          <h2 className="text-2xl font-bold mb-6">Available Positions</h2>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} userId={user.id} />
              ))}
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

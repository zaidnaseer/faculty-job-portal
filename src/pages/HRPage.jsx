import { useState, useEffect } from 'react';
import FacultyCard from '../components/FacultyCard';
import { FaSearch, FaFilter } from 'react-icons/fa';

const HRPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    job: 'all',
    status: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [facultyData, setFacultyData] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const fetchData = async () => {
      try {
        const [facultyRes, jobsRes] = await Promise.all([
          fetch('http://localhost:5000/api/faculty'),
          fetch('http://localhost:5000/api/jobs')
        ]);

        const facultyData = await facultyRes.json();
        const jobsData = await jobsRes.json();

        // Map faculty data to include job titles
        const applicants = facultyData.map(faculty => ({
          ...faculty,
          jobs: faculty.appliedJobs.map(job => job?.title || 'Unknown Position')
        }));

        setFacultyData(applicants);
        setJobs(['all', ...jobsData.map(job => job.title)]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statuses = ['all', 'new', 'reviewed', 'interviewing', 'offered', 'rejected'];

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter applicants based on search and filters
  const filteredApplicants = facultyData.filter(applicant => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesJob = filters.job === 'all' || applicant.jobs.includes(filters.job);
    const matchesStatus = filters.status === 'all' || applicant.status === filters.status;

    return matchesSearch && matchesJob && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">HR Dashboard</h1>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search applicants..."
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

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            {/* Job Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                name="job"
                value={filters.job}
                onChange={handleFilterChange}
                className="form-input"
              >
                {jobs.map(job => (
                  <option key={job} value={job}>
                    {job === 'all' ? 'All Positions' : job}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Application Status
              </label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-input"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Faculty Applicants</h2>
        <span className="text-gray-600">{filteredApplicants.length} results</span>
      </div>

      {filteredApplicants.length > 0 ? (
        <div className="space-y-4">
          {filteredApplicants.map(faculty => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No matching applicants found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}
    </div>
  );
};

export default HRPage;

import { useState } from 'react';
import FeaturedJobSlider from '../components/FeaturedJobSlider';
import JobCard from '../components/JobCard';
import { FaSearch, FaFilter } from 'react-icons/fa';
import {mockJobs} from '../data/mockJobs';

const VacanciesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    department: 'all',
    location: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Get unique values for filter dropdowns
  const departments = ['all', ...new Set(mockJobs.map(job => job.department))];
  const locations = ['all', ...new Set(mockJobs.map(job => job.location))];
  const jobTypes = ['all', ...new Set(mockJobs.map(job => job.type))];
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Filter jobs based on search term and filters
  const filteredJobs = mockJobs.filter(job => {
    // Search term filter
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Dropdown filters
    const matchesType = filters.type === 'all' || job.type === filters.type;
    const matchesDepartment = filters.department === 'all' || job.department === filters.department;
    const matchesLocation = filters.location === 'all' || job.location === filters.location;
    
    return matchesSearch && matchesType && matchesDepartment && matchesLocation;
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      <FeaturedJobSlider jobs={mockJobs} />
      
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
                  {jobTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
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
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
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
                  {locations.map(location => (
                    <option key={location} value={location}>
                      {location === 'all' ? 'All Locations' : location}
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
            {filteredJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No matching positions found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find more opportunities.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VacanciesPage;

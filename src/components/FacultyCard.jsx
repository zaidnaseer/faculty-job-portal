import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaUniversity } from 'react-icons/fa';

const FacultyCard = ({ faculty }) => {
  return (
    <div className="card flex flex-col md:flex-row gap-4 mb-4">
      <div className="flex-shrink-0">
        <img 
          src={faculty.profileImage || "/assets/default-profile.jpg"} 
          alt={faculty.name}
          className="w-24 h-24 object-cover rounded-full"
        />
      </div>
      
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
          <h3 className="text-lg font-bold">{faculty.name}</h3>
          <div className="text-sm text-gray-500">
            Applied: {faculty.appliedDate}
          </div>
        </div>
        
        <p className="mt-1 text-primary font-medium">{faculty.specialization}</p>
        
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          <div className="flex items-center">
            <FaEnvelope className="mr-2 text-gray-400" />
            <span>{faculty.email}</span>
          </div>
          <div className="flex items-center">
            <FaPhone className="mr-2 text-gray-400" />
            <span>{faculty.phone}</span>
          </div>
          <div className="flex items-center">
            <FaUniversity className="mr-2 text-gray-400" />
            <span>{faculty.currentInstitution}</span>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {faculty.skills.slice(0, 4).map((skill, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {skill}
            </span>
          ))}
          {faculty.skills.length > 4 && (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
              +{faculty.skills.length - 4} more
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0 flex flex-col gap-2">
        <Link 
          to={`/hr/resume/${faculty.id}`} 
          className="btn btn-primary text-center whitespace-nowrap"
        >
          View Resume
        </Link>
        <button className="btn btn-outline text-center whitespace-nowrap">
          Schedule Interview
        </button>
      </div>
    </div>
  );
};

export default FacultyCard;

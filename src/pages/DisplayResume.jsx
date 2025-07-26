import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DisplayResume = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const facultyId = location.state?.facultyId;;
  const { user } = useContext(AuthContext);
  const [resume, setResume] = useState(null);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/resume/${facultyId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setResume(data);
      } catch (err) {
        console.error("Error fetching resume:", err);
      }
    };

    if (facultyId) fetchResume();
  }, [facultyId, user.token]);

  if (!resume) {
    return <p className="text-center">Loading resume...</p>;
  }

  return (
    <div className="card p-6 max-w-5xl mx-auto m-2">
      <div className="mb-4">
        <button
          onClick={() => window.history.back()}
          className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
        >
          Go Back
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Applicant Resume</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Section */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center">
            <img
              src={resume.profileImage || "/assets/default-profile.jpg"}
              alt={resume.name}
              className="w-40 h-40 object-cover rounded-full mb-4"
            />
            <h3 className="text-xl font-bold">{resume.name}</h3>
            <p className="text-gray-600">{resume.title}</p>

            {/* Contact Information */}
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Contact Information</h4>
              <div className="space-y-2">
                <p>Email: {resume.email}</p>
                <p>Phone: {resume.phone}</p>
                <p>Location: {resume.location}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-4 w-full">
              <h4 className="font-semibold mb-2">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resume Details Section */}
        <div className="md:col-span-2">
          {/* About Me */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">About Me</h3>
            <p className="text-gray-700">{resume.summary}</p>
          </div>

          {/* Education */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Education</h3>
            {resume.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <p>{edu.degree} - {edu.institution}</p>
              </div>
            ))}
          </div>

          {/* Work Experience */}
          <div className="mb-6">
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Work Experience</h3>
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold">{exp.title}</h4>
                <p className="text-gray-700">{exp.institution} ({exp.start} - {exp.end || "Present"})</p>
              </div>
            ))}
          </div>

          {/* Publications */}
          <div>
            <h3 className="text-lg font-bold border-b pb-2 mb-3">Publications</h3>
            {resume.publications.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {resume.publications.map((pub, index) => (
                  <div key={index} className="bg-white shadow rounded-lg p-4 flex flex-col h-full">
                    <span className="font-semibold text-base mb-2">{pub.title}</span>
                    {pub.description && (
                      <span className="text-gray-700 mb-2">{pub.description}</span>
                    )}
                    {pub.link && (
                      <a
                        href={pub.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline mt-auto"
                      >
                        Visit
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No publications added.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplayResume;

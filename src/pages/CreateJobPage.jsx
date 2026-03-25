import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RippleBackground from "../components/RippleBackground";

const CreateJobPage = () => {
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    type: "Full-time",
    location: "",
    description: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authorization token not found");

      const response = await fetch(`${backendUrl}/api/jobs`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(",").map((skill) => skill.trim()), // Convert skills to array
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create job");
      }

      setSuccess("Job created successfully!");
      navigate("/hr"); // Redirect to vacancies page
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <RippleBackground>
      <div className="container py-8">
        <h2 className="text-2xl font-bold mb-6">Create New Job</h2>

        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          {/* Job Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input w-full"
            />
          </div>

          {/* Department */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="form-input w-full"
            />
          </div>

          {/* Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="form-input w-full"
              required
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="form-input w-full"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
              className="form-input w-full"
            />
          </div>

          {/* Skills */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              className="form-input w-full"
            />
          </div>

          {/* Error and Success Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className={`btn btn-primary w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </RippleBackground>
  );
};

export default CreateJobPage;

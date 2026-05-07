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
    skills: [],
    reapplyCooldownMonths: "1",
  });
  const [skillInput, setSkillInput] = useState("");
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
          skills: formData.skills,
          reapplyCooldownMonths: Number(formData.reapplyCooldownMonths),
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
      <div className="container py-10">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 px-6 py-8 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-sky-200">HR Portal</p>
          <h2 className="mt-3 text-3xl font-semibold">Create a new job posting</h2>
          <p className="mt-2 max-w-2xl text-sm text-sky-100">
            Share the role details, highlight the skills you need, and set a reapply window for candidates.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-lg md:p-8">
          <div className="mb-8 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-6">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-800">Job Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="form-input w-full"
                  placeholder="Assistant Professor of Computer Science"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-800">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="form-input w-full"
                  placeholder="School of Engineering"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-800">Type</label>
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
              <div>
                <label className="block text-sm font-medium text-gray-800">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="form-input w-full"
                  placeholder="Boston, MA (Hybrid)"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Posting tips
              </p>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li>Highlight impact, funding, and collaboration opportunities.</li>
                <li>Specify teaching expectations and research focus areas.</li>
                <li>Use 5-8 core skills to help candidates self-select.</li>
              </ul>
              <div className="mt-4 rounded-lg bg-white px-3 py-2 text-xs text-slate-500">
                You can edit the posting later from your HR dashboard.
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="form-input w-full"
              placeholder="Describe responsibilities, research expectations, and teaching load."
            />
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800">Skills</label>
            <p className="mt-1 text-xs text-gray-500">Add the most important skills for this role.</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                className="form-input flex-1 max-w-sm"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = skillInput.trim();
                  if (!trimmed) return;
                  setFormData((prev) => ({
                    ...prev,
                    skills: prev.skills.includes(trimmed)
                      ? prev.skills
                      : [...prev.skills, trimmed]
                  }));
                  setSkillInput("");
                }}
                className="btn btn-outline"
              >
                Add skill
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          skills: prev.skills.filter((entry) => entry !== skill),
                        }))
                      }
                      className="text-blue-700 hover:text-blue-900"
                      aria-label={`Remove ${skill}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reapply Cooldown */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-800">Allow Candidates to Reapply After</label>
            <select
              name="reapplyCooldownMonths"
              value={formData.reapplyCooldownMonths}
              onChange={handleChange}
              className="form-input w-full max-w-sm"
              required
            >
              <option value="1">1 month</option>
              <option value="3">3 months</option>
              <option value="6">6 months</option>
            </select>
          </div>

          {/* Error and Success Message */}
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

          {/* Submit Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Posting will be visible immediately to candidates.
            </p>
            <button
              type="submit"
              className={`btn btn-primary w-full sm:w-auto ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
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

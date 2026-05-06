import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import RippleBackground from "../components/RippleBackground";

const JobApplicantsPage = () => {
    const { jobId } = useParams();
    const { user } = useContext(AuthContext);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [applicants, setApplicants] = useState([]);
    const [jobTitle, setJobTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchApplicants = async () => {
            try {
                const response = await fetch(`${backendUrl}/api/jobs/${jobId}/applicants`, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                if (!response.ok) throw new Error("Failed to fetch applicants");
                const data = await response.json();
                setApplicants(data.applicants || []);
                setJobTitle(data.jobTitle || "");
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

            setApplicants((prev) => prev.filter((faculty) => faculty._id !== applicantId));
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            setRejectingId(null);
        }
    };

    return (
        <RippleBackground>
            <div className="container py-8">
                <button
                    className="mb-6 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>
                <h2 className="text-2xl font-bold mb-4 text-blue-800">Applicants for: <span className="text-gray-800">{jobTitle}</span></h2>
                {loading ? (
                    <p className="text-gray-500">Loading applicants...</p>
                ) : applicants.length === 0 ? (
                    <p className="text-gray-400">No applicants for this job yet.</p>
                ) : (
                    <ul className="divide-y divide-gray-100 bg-white rounded-xl shadow p-6">
                        {applicants.map((faculty) => (
                            <li key={faculty._id} className="flex items-center py-3">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold mr-4">
                                    {faculty.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800">{faculty.name}</div>
                                    <div className="text-gray-500 text-xs">{faculty.email}</div>
                                </div>
                                <button
                                    onClick={() =>
                                        navigate(`/display-profile?facultyId=${faculty._id}&jobId=${jobId}`, {
                                            state: { facultyId: faculty._id, jobId },
                                        })
                                    }
                                    className="ml-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={() => handleRejectApplicant(faculty._id)}
                                    disabled={rejectingId === faculty._id}
                                    className="ml-2 px-3 py-1 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 text-xs transition disabled:text-rose-300"
                                >
                                    {rejectingId === faculty._id ? "Rejecting..." : "Reject"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </RippleBackground>
    );
};

export default JobApplicantsPage;

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import JobCard from "../components/JobCard";
import RippleBackground from "../components/RippleBackground";

const MyApplicationsPage = () => {
  const { user } = useContext(AuthContext);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingJobId, setWithdrawingJobId] = useState(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [pendingWithdrawJobId, setPendingWithdrawJobId] = useState(null);


  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/jobs/my-applications`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await response.json();
        setAppliedJobs(data);
      } catch (error) {
        console.error("Error fetching applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedJobs();
  }, [user, backendUrl]);

  const openWithdrawModal = (jobId) => {
    setPendingWithdrawJobId(jobId);
    setShowWithdrawModal(true);
  };

  const closeWithdrawModal = () => {
    if (withdrawingJobId) {
      return;
    }

    setShowWithdrawModal(false);
    setPendingWithdrawJobId(null);
  };

  const confirmWithdraw = async () => {
    if (!pendingWithdrawJobId) {
      return;
    }

    setWithdrawingJobId(pendingWithdrawJobId);
    try {
      const response = await fetch(`${backendUrl}/api/jobs/withdraw/${pendingWithdrawJobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedJobs((prevJobs) =>
          prevJobs.filter((job) => job._id !== pendingWithdrawJobId)
        );
        setShowWithdrawModal(false);
        setPendingWithdrawJobId(null);
      } else {
        alert(data.message || "Failed to withdraw application");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setWithdrawingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <RippleBackground>
    <div className="container py-8">
      <h2 className="text-2xl font-bold mb-6">My Applications</h2>

      {appliedJobs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600">You haven't applied for any jobs yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appliedJobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              userId={user.id}
              showWithdraw={true}
              onWithdraw={openWithdrawModal}
              isWithdrawing={withdrawingJobId === job._id}
            />
          ))}
        </div>
      )}
    </div>

    {showWithdrawModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div
          className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-modal-title"
        >
          <h3 id="withdraw-modal-title" className="text-lg font-semibold text-gray-900">
            Withdraw application?
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to withdraw your application? This action cannot be undone.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={closeWithdrawModal}
              disabled={Boolean(withdrawingJobId)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmWithdraw}
              disabled={Boolean(withdrawingJobId)}
              className="btn bg-red-600 border-red-600 text-white hover:bg-red-700 hover:border-red-700 disabled:bg-red-300 disabled:border-red-300"
            >
              {withdrawingJobId ? "Withdrawing..." : "Yes, withdraw"}
            </button>
          </div>
        </div>
      </div>
    )}
     </RippleBackground>
  );
};

export default MyApplicationsPage;

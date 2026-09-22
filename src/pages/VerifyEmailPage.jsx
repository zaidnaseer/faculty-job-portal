import { useContext, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelopeOpenText } from "react-icons/fa";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import RippleBackground from "../components/RippleBackground";
import { AuthContext } from "../context/AuthContext";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const { user, login, logout } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const homeRoute = user.role === "hr" ? "/hr" : "/vacancies";

  if (!user.emailVerificationRequired || user.isEmailVerified) {
    return <Navigate to={homeRoute} replace />;
  }

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsResending(true);

    try {
      if (!auth.currentUser) {
        throw new Error("Please sign in again to resend the verification email.");
      }
      await sendEmailVerification(auth.currentUser);
      setMessage(`Verification email sent to ${user.email}. Please check your inbox (and spam folder).`);
    } catch (err) {
      setError(err.message || "Could not send verification email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setError("");
    setMessage("");
    setIsChecking(true);

    try {
      if (!auth.currentUser) {
        throw new Error("Please sign in again to continue.");
      }
      await auth.currentUser.reload();
      if (!auth.currentUser.emailVerified) {
        setMessage("Your email isn't verified yet. Please click the link in the email we sent you.");
        return;
      }

      const idToken = await auth.currentUser.getIdToken(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not confirm verification. Please try logging in again.");
      }

      login(data.user, data.token, data.emailVerificationRequired);
      navigate(data.user?.role === "hr" ? "/hr" : "/vacancies");
    } catch (err) {
      setError(err.message || "Could not confirm verification. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <RippleBackground>
      <div className="min-h-screen py-12 flex items-center justify-center bg-gray-0">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <FaEnvelopeOpenText className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Verify your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We sent a verification link to <span className="font-medium">{user.email}</span>.{" "}
              {user.role === "hr"
                ? "Employer accounts must verify their email before using Upaadhyay."
                : "You can keep browsing, but you'll need to verify before applying to any job."}
            </p>
          </motion.div>

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md text-sm">{error}</div>
          )}
          {message && (
            <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">{message}</div>
          )}

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleCheckVerified}
              disabled={isChecking}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white font-medium ${isChecking ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
            >
              {isChecking ? "Checking..." : "I've verified my email"}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
            >
              {isResending ? "Sending..." : "Resend verification email"}
            </button>

            {user.role !== "hr" && (
              <button
                type="button"
                onClick={() => navigate(homeRoute)}
                className="w-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-150"
              >
                Skip for now
              </button>
            )}
          </div>

          <p className="text-sm text-gray-600">
            Wrong account?{" "}
            <Link
              to="/login"
              onClick={logout}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign out
            </Link>
          </p>
        </div>
      </div>
    </RippleBackground>
  );
};

export default VerifyEmailPage;

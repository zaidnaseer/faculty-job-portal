import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaSignInAlt } from "react-icons/fa";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import RippleBackground from "../components/RippleBackground";


const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { email, password } = formData;
      const firebaseCredential = await signInWithEmailAndPassword(auth, email, password);

      const idToken = await firebaseCredential.user.getIdToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      console.log("LoginData",data);
      await login(data.user, data.token);
      
      if (data.role === "faculty") {
        console.log("Faculty login",data.token);
        navigate("/resume"); // Redirect faculty to resume page
      } else if (data.role === "hr") {
        navigate("/hr"); // Redirect HR to HR page
      } else{
        setError("Invalid role. Please contact support.");
        console.error("Invalid role:", data.role);
      }
    } catch (err) {
      setError(err.message || "Failed to sign in. Please check your credentials or report if error persists.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RippleBackground>
    <div className="min-h-screen py-12 flex items-center justify-center bg-gray-0">
      
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-800 p-4 rounded-md text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
        >
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FaUser />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <FaLock />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white font-medium ${
                isLoading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaSignInAlt className={`h-5 w-5 ${isLoading ? "text-blue-300" : "text-blue-500"} group-hover:text-blue-400`} />
              </span>
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </motion.form>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-4"
        >
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create your account here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  </RippleBackground>
  );
};

export default Login;

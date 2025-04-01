import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import VacanciesPage from "./pages/VacanciesPage";
import ResumePage from "./pages/ResumePage";
import HRPage from "./pages/HRPage";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import AddResumePage from "./pages/AddResumePage";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import CreateJobPage from "./pages/CreateJobPage";
import HRDashboard from "./pages/HRDashboard";
import MyApplicationsPage from "./pages/MyApplicationsPage";
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    alert("You are not allowed to access this page");
    return <Navigate to="/login" />;
  }

  return element;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Faculty-only routes */}
          <Route
            path="/vacancies"
            element={<ProtectedRoute element={<VacanciesPage />} allowedRoles={["faculty"]} />}
          />
          <Route
            path="/resume"
            element={<ProtectedRoute element={<ResumePage />} allowedRoles={["faculty"]} />}
          />
          <Route
            path="/add-resume"
            element={<ProtectedRoute element={<AddResumePage />} allowedRoles={["faculty"]} />}
          />
          <Route 
            path="/my-applications"
            element={<ProtectedRoute element={<MyApplicationsPage />} allowedRoles={["faculty"]} />}
          />
          {/* HR-only routes */}
          <Route
            path="/hrD"
            element={<ProtectedRoute element={<HRPage />} allowedRoles={["hr"]} />}
          />
          <Route
            path="/create-job"
            element={<ProtectedRoute element={<CreateJobPage  />} allowedRoles={["hr"]} />}
          />
          
          <Route
            path="/hr"
            element={<ProtectedRoute element={<HRDashboard />} allowedRoles={["hr"]} />}
          />
        

          {/* Redirect to login if no route matches */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </main>
      <footer className="bg-dark text-white py-4 text-center">
        <p>© {new Date().getFullYear()} Upadhyaya. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

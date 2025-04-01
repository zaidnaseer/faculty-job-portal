import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext); // Get the logged-in user from context
  if (location.pathname === '/login') {
    return (
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="font-bold text-xl text-primary">Upadhyaya</Link>
          </div>
        </div>
      </nav>
    );
  }
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-xl text-primary">Upadhyaya</Link>
          
          <div className="flex space-x-4">
            {user?.role === 'faculty' ? (
              // Faculty Navigation Links
              <>
                <NavLink to="/vacancies" current={location.pathname}>Vacancies</NavLink>
                <NavLink to="/resume" current={location.pathname}>My Resume</NavLink>
                <NavLink to="/add-resume" current={location.pathname}>Create Resume</NavLink>
                <NavLink to="/my-applications" current={location.pathname}>My Applications</NavLink>
                <NavLink to="/logout" current={location.pathname}>Logout</NavLink>
                
              </>
            ) : user?.role === 'hr' ? (
              // HR Navigation Links
              <>
                <NavLink to="/hr" current={location.pathname}>HR Dashboard</NavLink>
                <NavLink to="/create-job" current={location.pathname}>Post Job</NavLink>
                <NavLink to="/logout" current={location.pathname}>Logout</NavLink>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, current }) => {
  const isActive = current === to || (current === '/' && to === '/vacancies');
  
  return (
    <Link 
      to={to} 
      className={`px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}
    >
      {children}
    </Link>
  );
};

export default Navbar;

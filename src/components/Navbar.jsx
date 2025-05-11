import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
  // Redirect to appropriate page based on user role
  if(location.pathname === '/') {
    if(user){
      if (user.role === 'faculty') {
        navigate('/vacancies');
      }
      else if (user.role === 'hr') {
        navigate('/hr');
      }
      return null;
    }else{
      return null;
    }
  }

  const handleLogout = () => {
    logout();
    navigate('/'); // Navigate to landing page after logout
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-2xl text-primary">Upadhyaya</Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-primary focus:outline-none"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-4">
            {!user ? (
              // Public Navigation Links
              <>
                <NavLink to="/login" current={location.pathname}>Sign In</NavLink>
                <NavLink to="/register" current={location.pathname}>Register</NavLink>
              </>
            ) : user.role === 'faculty' ? (
              // Faculty Navigation Links
              <>
                <NavLink to="/vacancies" current={location.pathname}>Vacancies</NavLink>
                <NavLink to="/resume" current={location.pathname}>My Resume</NavLink>
                <NavLink to="/add-resume" current={location.pathname}>Create Resume</NavLink>
                <NavLink to="/my-applications" current={location.pathname}>Applications</NavLink>
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : user.role === 'hr' ? (
              // HR Navigation Links
              <>
                <NavLink to="/hr" current={location.pathname}>Dashboard</NavLink>
                <NavLink to="/create-job" current={location.pathname}>Post Job</NavLink>
                <button 
                  onClick={handleLogout} 
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </>
            ) : null}
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white p-4 border-t">
            {!user ? (
              // Public Navigation Links
              <div className="flex flex-col space-y-2">
                <MobileNavLink to="/login" onClick={toggleMobileMenu}>Sign In</MobileNavLink>
                <MobileNavLink to="/register" onClick={toggleMobileMenu}>Register</MobileNavLink>
              </div>
            ) : user.role === 'faculty' ? (
              // Faculty Navigation Links
              <div className="flex flex-col space-y-2">
                <MobileNavLink to="/vacancies" onClick={toggleMobileMenu}>Vacancies</MobileNavLink>
                <MobileNavLink to="/resume" onClick={toggleMobileMenu}>My Resume</MobileNavLink>
                <MobileNavLink to="/my-applications" onClick={toggleMobileMenu}>Applications</MobileNavLink>
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }} 
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : user.role === 'hr' ? (
              // HR Navigation Links
              <div className="flex flex-col space-y-2">
                <MobileNavLink to="/hr" onClick={toggleMobileMenu}>Dashboard</MobileNavLink>
                <MobileNavLink to="/create-job" onClick={toggleMobileMenu}>Post Job</MobileNavLink>
                <button 
                  onClick={() => {
                    handleLogout();
                    toggleMobileMenu();
                  }} 
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        )}
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

const MobileNavLink = ({ to, children, onClick }) => {
  return (
    <Link 
      to={to} 
      onClick={onClick}
      className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
};
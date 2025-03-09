import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="font-bold text-xl text-primary">Faculty Portal</Link>
          
          <div className="flex space-x-4">
            <NavLink to="/vacancies" current={location.pathname}>Vacancies</NavLink>
            <NavLink to="/resume" current={location.pathname}>My Resume</NavLink>
            <NavLink to="/hr" current={location.pathname}>HR Dashboard</NavLink>
          </div>
        </div>
      </div>
    </nav>
  )
}

const NavLink = ({ to, children, current }) => {
  const isActive = current === to || (current === '/' && to === '/vacancies')
  
  return (
    <Link 
      to={to} 
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive 
          ? 'bg-primary text-white' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  )
}

export default Navbar

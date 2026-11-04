import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const dashboardLink = user && user.role === 'admin' ? '/admin' : '/dashboard'

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        ArchConnect
      </Link>

      <div className="nav-links">
        {user ? (
          <>
            <Link to={dashboardLink}>Dashboard</Link>
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar

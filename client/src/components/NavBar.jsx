import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from './Brand';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-brand"><Brand /></div>
      <nav className="navbar-links">
        <NavLink to="/jobs" className={({ isActive }) => (isActive ? 'active' : '')}>
          Jobs
        </NavLink>
        <NavLink to="/candidates" className={({ isActive }) => (isActive ? 'active' : '')}>
          Candidates
        </NavLink>
      </nav>
      <div className="navbar-user">
        <span>
          {user.name} <span className="role-tag">{user.role}</span>
        </span>
        <button className="btn-link" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </header>
  );
}

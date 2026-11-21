import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canCreateStall } from '../utils/permissions';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          Review Kantin
        </Link>
        <nav className="nav-links">
          <Link to="/">Daftar Warung</Link>
          {canCreateStall(user) && <Link to="/stalls/new">Tambah Warung</Link>}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span>{user.name}</span>
              <span className={`badge role-${user.role}`}>{user.role}</span>
              <button className="btn btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-sm" to="/login">
                Login
              </Link>
              <Link className="btn btn-sm btn-primary" to="/register">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
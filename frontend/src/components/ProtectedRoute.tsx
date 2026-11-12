import type { ReactNode } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import Loading from './Loading';

interface Props {
  roles?: Role[];
  children: ReactNode;
}

export default function ProtectedRoute({ roles, children }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading text="Memeriksa sesi..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: 'login-required' }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="alert alert-error" role="alert">
        <span>
          <strong>403 - Akses ditolak.</strong> Role kamu ({user.role}) tidak punya akses ke halaman ini.{' '}
          <Link to="/">Kembali ke beranda</Link>
        </span>
      </div>
    );
  }

  return <>{children}</>;
}
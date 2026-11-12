import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { parseApiError } from '../api/error';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: string;
  registered?: boolean;
  reason?: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});
    try {
      await login(email, password);
      navigate(state?.from ?? '/', { replace: true });
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      setSubmitting(false);
    }
  }

  return (
    <section className="form-card narrow">
      <h1>Login</h1>

      {state?.registered && <div className="alert alert-success">Registrasi berhasil. Silakan login.</div>}
      {state?.reason === 'login-required' && (
        <div className="alert alert-info">Silakan login terlebih dahulu untuk mengakses halaman tersebut.</div>
      )}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          {fieldErrors.email && <small className="field-error">{fieldErrors.email}</small>}
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {fieldErrors.password && <small className="field-error">{fieldErrors.password}</small>}
        </label>
        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Memproses...' : 'Login'}
        </button>
      </form>

      <p className="muted center">
        Belum punya akun? <Link to="/register">Register</Link>
      </p>
    </section>
  );
}
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { parseApiError } from '../api/error';
import { deleteStall, getStall } from '../api/stalls';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import type { Stall } from '../types';
import { canDeleteStall, canEditStall } from '../utils/permissions';

export default function StallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash;
  const { user } = useAuth();

  const [stall, setStall] = useState<Stall | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getStall(id)
      .then((result) => {
        if (!cancelled) setStall(result);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  async function handleDelete() {
    if (!stall) return;
    if (!window.confirm(`Hapus warung "${stall.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

    setDeleting(true);
    setActionError(null);
    try {
      await deleteStall(stall.id);
      navigate('/', { state: { flash: 'Warung berhasil dihapus.' } });
    } catch (err) {
      setActionError(parseApiError(err).message);
      setDeleting(false);
    }
  }

  if (loading) return <Loading />;

  if (error || !stall) {
    return (
      <div>
        <ErrorMessage message={error ?? 'Warung tidak ditemukan.'} onRetry={() => setReloadKey((k) => k + 1)} />
        <Link to="/">← Kembali ke daftar</Link>
      </div>
    );
  }

  return (
    <article className="detail">
      <Link to="/" className="back">
        ← Kembali ke daftar
      </Link>

      {flash && <div className="alert alert-success">{flash}</div>}

      <div className="detail-head">
        <div>
          <h1>{stall.name}</h1>
          <div className="badges">
            {stall.category && <span className="badge">{stall.category}</span>}
            {stall.isPopular && <span className="badge badge-hot">Populer</span>}
          </div>
        </div>
        <div className="actions">
          {canEditStall(user, stall) && (
            <Link className="btn" to={`/stalls/${stall.id}/edit`}>
              Ubah
            </Link>
          )}
          {canDeleteStall(user) && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Menghapus...' : 'Hapus'}
            </button>
          )}
        </div>
      </div>

      {actionError && <div className="alert alert-error">{actionError}</div>}

      <dl className="info">
        <dt>Lokasi</dt>
        <dd>{stall.location ?? '-'}</dd>
        <dt>Rating</dt>
        <dd>
          ★ {Number(stall.avgRating).toFixed(1)} ({stall.reviewCount} ulasan)
        </dd>
        <dt>Deskripsi</dt>
        <dd>{stall.description || 'Belum ada deskripsi.'}</dd>
      </dl>
    </article>
  );
}
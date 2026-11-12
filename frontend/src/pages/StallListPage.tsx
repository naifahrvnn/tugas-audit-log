import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { parseApiError } from '../api/error';
import { listStalls } from '../api/stalls';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Pagination from '../components/Pagination';
import StallCard from '../components/StallCard';
import { useAuth } from '../context/AuthContext';
import type { PageMeta, Stall } from '../types';
import { canCreateStall } from '../utils/permissions';

const LIMIT = 6;

export default function StallListPage() {
  const { user } = useAuth();
  const location = useLocation();
  const flash = (location.state as { flash?: string } | null)?.flash;
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  const [searchInput, setSearchInput] = useState(search);
  const [categoryInput, setCategoryInput] = useState(category);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listStalls({
      search: search || undefined,
      category: category || undefined,
      page,
      limit: LIMIT,
    })
      .then((result) => {
        if (cancelled) return;
        setStalls(result.data);
        setMeta(result.meta);
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
  }, [search, category, page, reloadKey]);

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams();
    if (searchInput.trim()) next.set('search', searchInput.trim());
    if (categoryInput.trim()) next.set('category', categoryInput.trim());
    setSearchParams(next);
  }

  function resetFilters() {
    setSearchInput('');
    setCategoryInput('');
    setSearchParams(new URLSearchParams());
  }

  function goToPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(nextPage));
    setSearchParams(next);
  }

  const filtering = Boolean(search || category);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Daftar Warung</h1>
          <p className="muted">Temukan warung kantin favoritmu.</p>
        </div>
        {canCreateStall(user) && (
          <Link className="btn btn-primary" to="/stalls/new">
            + Tambah Warung
          </Link>
        )}
      </div>

      {flash && <div className="alert alert-success">{flash}</div>}

      <form className="filters" onSubmit={applyFilters}>
        <input
          type="text"
          placeholder="Cari nama warung..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <input
          type="text"
          placeholder="Kategori (misal: Nasi)"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Cari
        </button>
        {filtering && (
          <button type="button" className="btn" onClick={resetFilters}>
            Reset
          </button>
        )}
      </form>

      {loading && <Loading />}

      {!loading && error && <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!loading && !error && stalls.length === 0 && (
        <EmptyState
          title={filtering ? 'Warung tidak ditemukan' : 'Belum ada data warung'}
          description={filtering ? 'Coba ubah kata kunci atau kategori pencarian.' : undefined}
        />
      )}

      {!loading && !error && stalls.length > 0 && meta && (
        <>
          <p className="muted">Total {meta.total} warung</p>
          <div className="grid">
            {stalls.map((stall) => (
              <StallCard key={stall.id} stall={stall} />
            ))}
          </div>
          <Pagination page={meta.page} total={meta.total} limit={meta.limit} onChange={goToPage} />
        </>
      )}
    </section>
  );
}
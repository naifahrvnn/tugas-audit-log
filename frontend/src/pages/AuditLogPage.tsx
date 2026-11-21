import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { parseApiError } from '../api/error';
import { getAuditLog, listAuditLogs } from '../api/auditLogs';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import type { AuditLog, AuditPagination } from '../types';

const PAGE_SIZE = 10;
const formatDate = (iso: string | null): string => (iso ? new Date(iso).toLocaleString('id-ID') : '-');

function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const [log, setLog] = useState<AuditLog | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal memanggil GET /audit-logs/:id, bukan memakai data baris tabel.
  useEffect(() => {
    let cancelled = false;
    getAuditLog(id)
      .then((data) => {
        if (!cancelled) setLog(data);
      })
      .catch((err) => {
        if (!cancelled) setError(parseApiError(err).message);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <Modal title={`Detail Audit #${id}`} onClose={onClose}>
      {error && <ErrorMessage message={error} />}
      {!log && !error && <Loading text="Memuat detail..." />}
      {log && (
        <dl className="info">
          <dt>Waktu</dt>
          <dd>{formatDate(log.createdAt)}</dd>
          <dt>Pengguna</dt>
          <dd>
            {log.userName ?? '-'} ({log.userEmail ?? '-'})
          </dd>
          <dt>Aksi</dt>
          <dd>{log.action}</dd>
          <dt>Target</dt>
          <dd>
            {log.targetTable} #{log.targetId}
          </dd>
          <dt>Role</dt>
          <dd>{log.metadata?.role ?? '-'}</dd>
          <dt>Result</dt>
          <dd>{log.metadata?.result ?? '-'}</dd>
          <dt>IP address</dt>
          <dd>{log.metadata?.ip_address ?? '-'}</dd>
          <dt>User agent</dt>
          <dd>{log.metadata?.user_agent ?? '-'}</dd>
          <dt>Metadata</dt>
          <dd>
            <pre className="json">{JSON.stringify(log.metadata, null, 2)}</pre>
          </dd>
        </dl>
      )}
    </Modal>
  );
}

export default function AuditLogPage() {
  const [draft, setDraft] = useState({ targetId: '', userId: '' });
  const [filters, setFilters] = useState({ targetId: '', userId: '' });
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<AuditPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAuditLogs({
      page,
      pageSize: PAGE_SIZE,
      targetId: filters.targetId.trim() || undefined,
      userId: filters.userId.trim() || undefined,
    })
      .then((result) => {
        if (cancelled) return;
        setItems(result.items);
        setPagination(result.pagination);
      })
      .catch((err) => {
        if (cancelled) return;
        const parsed = parseApiError(err);
        setError(Object.values(parsed.fieldErrors)[0] ?? parsed.message);
        setItems([]);
        setPagination(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters, page, reloadKey]);

  function applyFilters(e: FormEvent) {
    e.preventDefault();
    setFilters({ ...draft });
    setPage(1);
  }

  function resetFilters() {
    const empty = { targetId: '', userId: '' };
    setDraft(empty);
    setFilters(empty);
    setPage(1);
  }

  const filtering = Boolean(filters.targetId || filters.userId);

  return (
    <section>
      <div className="page-header">
        <div>
          <h1>Audit Log</h1>
          <p className="muted">Riwayat aktivitas pengguna (hanya baca).</p>
        </div>
      </div>

      <form className="filters" onSubmit={applyFilters}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Target ID"
          value={draft.targetId}
          onChange={(e) => setDraft({ ...draft, targetId: e.target.value })}
        />
        <input
          type="text"
          inputMode="numeric"
          placeholder="User ID"
          value={draft.userId}
          onChange={(e) => setDraft({ ...draft, userId: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">
          Terapkan
        </button>
        {filtering && (
          <button type="button" className="btn" onClick={resetFilters}>
            Reset
          </button>
        )}
      </form>

      {loading && <Loading text="Memuat audit log..." />}

      {!loading && error && <ErrorMessage message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!loading && !error && items.length === 0 && (
        <EmptyState
          title="Tidak ada catatan audit"
          description={filtering ? 'Coba ubah filter.' : undefined}
        />
      )}

      {!loading && !error && items.length > 0 && pagination && (
        <>
          <p className="muted">Total {pagination.total} catatan</p>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pengguna</th>
                  <th>Aksi</th>
                  <th>Target</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      {log.userName ?? '-'}
                      <br />
                      <span className="muted">{log.userEmail}</span>
                    </td>
                    <td>
                      <span className="badge">{log.action}</span>
                    </td>
                    <td>
                      {log.targetTable} #{log.targetId}
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setSelectedId(log.id)}>
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={pagination.page} total={pagination.total} limit={pagination.pageSize} onChange={setPage} />
        </>
      )}

      {selectedId !== null && <DetailModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </section>
  );
}
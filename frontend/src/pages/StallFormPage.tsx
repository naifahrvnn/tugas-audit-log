import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { parseApiError } from '../api/error';
import { createStall, getStall, updateStall } from '../api/stalls';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import type { StallInput } from '../types';

interface FormState {
  name: string;
  category: string;
  location: string;
  description: string;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}

export default function StallFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ name: '', category: '', location: '', description: '' });
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Mode ubah: isi form dengan data warung yang ada.
  // Sengaja TIDAK ada cek kepemilikan di sini: kalau owner membuka warung milik orang lain
  // lalu menyimpan, backend yang menolak dengan 403 dan pesannya ditampilkan di bawah.
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    getStall(id)
      .then((stall) => {
        if (cancelled) return;
        setForm({
          name: stall.name,
          category: stall.category ?? '',
          location: stall.location ?? '',
          description: stall.description ?? '',
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(parseApiError(err).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    // Field opsional yang kosong tidak dikirim.
    const payload: StallInput = { name: form.name.trim() };
    if (form.category.trim()) payload.category = form.category.trim();
    if (form.location.trim()) payload.location = form.location.trim();
    if (form.description.trim()) payload.description = form.description.trim();

    try {
      const saved = id ? await updateStall(id, payload) : await createStall(payload);
      navigate(`/stalls/${saved.id}`, {
        state: { flash: id ? 'Warung berhasil diperbarui.' : 'Warung berhasil ditambahkan.' },
      });
    } catch (err) {
      const parsed = parseApiError(err);
      setError(parsed.message);
      setFieldErrors(parsed.fieldErrors);
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;
  if (loadError) {
    return (
      <div>
        <ErrorMessage message={loadError} />
        <Link to="/">← Kembali ke daftar</Link>
      </div>
    );
  }

  return (
    <section className="form-card">
      <h1>{isEdit ? 'Ubah Warung' : 'Tambah Warung'}</h1>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {/* noValidate: validasi dilakukan backend (zod), pesannya ditampilkan per field. */}
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Nama warung" error={fieldErrors.name}>
          <input name="name" value={form.name} onChange={handleChange} maxLength={100} />
        </Field>
        <Field label="Kategori" error={fieldErrors.category}>
          <input name="category" value={form.category} onChange={handleChange} maxLength={50} />
        </Field>
        <Field label="Lokasi" error={fieldErrors.location}>
          <input name="location" value={form.location} onChange={handleChange} maxLength={100} />
        </Field>
        <Field label="Deskripsi" error={fieldErrors.description}>
          <textarea name="description" rows={4} value={form.description} onChange={handleChange} maxLength={1000} />
        </Field>

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Menyimpan...' : 'Simpan'}
          </button>
          <Link className="btn" to={isEdit && id ? `/stalls/${id}` : '/'}>
            Batal
          </Link>
        </div>
      </form>
    </section>
  );
}
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';

export default function NotFoundPage() {
  return (
    <div>
      <EmptyState title="404 - Halaman tidak ditemukan" description="Alamat yang kamu buka tidak tersedia." />
      <p className="center">
        <Link to="/">← Kembali ke beranda</Link>
      </p>
    </div>
  );
}
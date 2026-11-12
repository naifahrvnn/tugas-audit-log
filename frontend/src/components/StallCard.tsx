import { Link } from 'react-router-dom';
import type { Stall } from '../types';

export default function StallCard({ stall }: { stall: Stall }) {
  return (
    <Link to={`/stalls/${stall.id}`} className="card stall-card">
      <div className="badges">
        {stall.category && <span className="badge">{stall.category}</span>}
        {stall.isPopular && <span className="badge badge-hot">Populer</span>}
      </div>
      <h3>{stall.name}</h3>
      <p className="muted"> {stall.location ?? 'Lokasi belum diisi'}</p>
      <p className="rating">
        ★ {Number(stall.avgRating).toFixed(1)} <span className="muted">({stall.reviewCount} ulasan)</span>
      </p>
    </Link>
  );
}
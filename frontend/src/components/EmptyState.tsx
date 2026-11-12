interface Props {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: Props) {
  return (
    <div className="state">
      <div className="state-icon">🍽️</div>
      <h3>{title}</h3>
      {description && <p className="muted">{description}</p>}
    </div>
  );
}
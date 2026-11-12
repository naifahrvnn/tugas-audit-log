export default function Loading({ text = 'Memuat data...' }: { text?: string }) {
  return (
    <div className="state" role="status">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
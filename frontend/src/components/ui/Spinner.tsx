export default function Spinner() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: '2px solid var(--border)',
          borderTopColor: 'var(--rose-gold)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: 12 }}>Loading...</span>
      <style>{'@keyframes spin {to {transform: rotate(360deg)}}'}</style>
    </div>
  );
}

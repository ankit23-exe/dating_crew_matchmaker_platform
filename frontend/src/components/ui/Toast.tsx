'use client';

interface Props {
  message: string;
  type?: 'success' | 'error';
}

export default function Toast({ message, type = 'success' }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        borderRadius: 12,
        padding: '12px 14px',
        fontSize: 12,
        color: type === 'success' ? '#2d6b40' : '#842d2d',
        background: type === 'success' ? '#e8f4ec' : '#f8eaea',
        border: `1px solid ${type === 'success' ? '#cae5d2' : '#efcece'}`,
        zIndex: 120,
      }}
    >
      {message}
    </div>
  );
}

import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div
  style={{
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  }}
>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'var(--grad-primary)',
            display: 'grid',
            placeItems: 'center',
            color: 'white',
            fontSize: 22,
            margin: '0 auto 10px',
          }}
        >
          ❤
        </div>
        <h1 className="serif" style={{ fontSize: 36, fontWeight: 500, margin: 0 }}>
          The Date Crew
        </h1>
      </div>
      <LoginForm />
    </div>
  );
}

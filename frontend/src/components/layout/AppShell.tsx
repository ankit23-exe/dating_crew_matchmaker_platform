'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname.startsWith('/dashboard') || pathname.startsWith('/client');

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <Sidebar />
      <main style={{ marginLeft: 220, padding: 24, minHeight: '100vh' }}>{children}</main>
    </div>
  );
}

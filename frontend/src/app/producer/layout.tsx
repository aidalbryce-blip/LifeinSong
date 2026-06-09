import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Producer Studio — Life in Song',
};

export default function ProducerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header
        style={{
          borderBottom: '1px solid var(--glass-border)',
          padding: '13px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Link
          href="/producer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--accent-400)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Life in Song
          </span>
          <span style={{ color: 'var(--glass-border)' }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--ink-400)' }}>Studio</span>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}

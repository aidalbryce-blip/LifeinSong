'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'Order',   href: '/intake' },
  { label: 'My Song', href: '/my-song' },
  { label: 'Studio',  href: '/producer' },
] as const;

export default function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <nav className="nav" style={{ width: '100%' }}>
      <Link href="/" className="brand">
        <div className="dot" />
        Life <span className="in">in</span> Song
      </Link>
      <div className="nav-links">
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${isActive(href) ? ' active' : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

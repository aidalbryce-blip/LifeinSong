'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const NAV_LINKS = [
  { label: 'Home',    href: '/' },
  { label: 'Order',   href: '/intake' },
  { label: 'My Song', href: '/my-song' },
  { label: 'Studio',  href: '/producer' },
] as const;

export default function Nav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  function isActive(href: string) {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setIsOpen(false); }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
    };
  }, []);

  return (
    <nav className="nav" style={{ width: '100%' }} ref={navRef}>
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

      <button
        className="nav-burger"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <div className="nav-mobile-menu">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`nav-mobile-link${isActive(href) ? ' active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

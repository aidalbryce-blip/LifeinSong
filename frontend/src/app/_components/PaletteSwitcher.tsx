'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function isPaperRoute(pathname: string): boolean {
  return pathname === '/' || pathname === '/intake' || pathname.startsWith('/intake/');
}

export default function PaletteSwitcher() {
  const pathname = usePathname();

  useEffect(() => {
    if (isPaperRoute(pathname)) {
      document.documentElement.setAttribute('data-mode', 'paper');
    } else {
      document.documentElement.removeAttribute('data-mode');
    }
  }, [pathname]);

  return null;
}

'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './footer';

export function ConditionalFooter() {
  const pathname = usePathname();

  const shouldHideFooter = pathname.startsWith('/dashboard') || pathname.startsWith('/orders');

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}

'use client';

import { useEffect, useRef } from 'react';

interface InfiniteScrollTriggerProps {
  onIntersect: () => void;
  loading?: boolean;
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function InfiniteScrollTrigger({
  onIntersect,
  loading = false,
  disabled = false,
  rootMargin = '100px',
  threshold = 0.1,
}: InfiniteScrollTriggerProps) {
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger || loading || disabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          onIntersect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(trigger);

    return () => {
      if (trigger) {
        observer.unobserve(trigger);
      }
    };
  }, [onIntersect, loading, disabled, rootMargin, threshold]);

  return <div ref={triggerRef} className="h-4" aria-hidden="true" />;
}
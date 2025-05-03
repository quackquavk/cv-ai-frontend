'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { pageview } from '@/app/utils/analytics';

export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      let url = pathname;
      if (searchParams?.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      pageview(url);
    }
  }, [pathname, searchParams]);
} 
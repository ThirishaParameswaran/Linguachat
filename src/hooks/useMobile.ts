import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;

export interface MobileInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

export function useMobile(): MobileInfo {
  const [windowDimensions, setWindowDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const isMobile = windowDimensions.width < MOBILE_BREAKPOINT;
  const isTablet = windowDimensions.width >= MOBILE_BREAKPOINT && windowDimensions.width < TABLET_BREAKPOINT;
  const isDesktop = windowDimensions.width >= TABLET_BREAKPOINT;
  const orientation = windowDimensions.height > windowDimensions.width ? 'portrait' : 'landscape';

  return {
    isMobile,
    isTablet,
    isDesktop,
    width: windowDimensions.width,
    height: windowDimensions.height,
    orientation,
  };
}

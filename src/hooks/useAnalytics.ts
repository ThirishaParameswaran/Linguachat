import { useState, useEffect, useCallback } from 'react';
import { analyticsService, AnalyticsData } from '../services/analyticsService';

export interface UseAnalyticsReturn {
  data: AnalyticsData;
  loading: boolean;
  error: Error | null;
  lastUpdated: string;
  refresh: () => void;
  isRefreshing: boolean;
}

/**
 * Custom React hook that subscribes to real-time dynamic analytics calculated
 * from Zustand store chat messages, AI translations, and quality gate items.
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [data, setData] = useState<AnalyticsData>(() => analyticsService.calculateAnalytics());
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  const refresh = useCallback(() => {
    setIsRefreshing(true);
    try {
      const updated = analyticsService.calculateAnalytics();
      setData(updated);
      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh analytics'));
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, []);

  useEffect(() => {
    try {
      const current = analyticsService.calculateAnalytics();
      setData(current);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load initial analytics'));
      setLoading(false);
    }

    const unsubscribe = analyticsService.subscribe((updatedData) => {
      setData(updatedData);
      setLastUpdated(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setError(null);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh,
    isRefreshing,
  };
}

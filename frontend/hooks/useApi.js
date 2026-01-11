/**
 * useApi Hook
 * Provides API call utilities with caching and error handling
 */

import { useState, useCallback, useEffect } from 'react';

const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    if (options.skip) return;
    fetchData().catch(() => {});
  }, [url, fetchData, options.skip]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export default useApi;

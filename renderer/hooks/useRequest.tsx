import React, { useEffect, useState } from 'react';

export interface UseRequestReturn<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  run: (...args: any[]) => Promise<T>;
}

export interface Response<T> {
  code: number;
  result: T;
}

export function useRequest<T>(
  action: (...args: any[]) => Promise<T>,
  options: {
    manual?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): UseRequestReturn<T> {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const fetchData = async (...args: any[]) => {
    let res;
    setLoading(true);

    try {
      res = await action(...args);
      options.onSuccess?.(res);
      setResponse(res);
    } catch (error) {
      if (options.onError) {
        options.onError(error as Error);
      } else {
        throw error;
      }
    }

    setLoading(false);
    return res as T;
  };

  useEffect(() => {
    if (!options.manual) {
      fetchData();
    }
  }, []);

  return {
    data: response,
    run: fetchData,
    loading,
  };
}

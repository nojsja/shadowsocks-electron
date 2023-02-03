import { useEffect, useState } from 'react';
import _ from 'lodash';

export interface UseRequestReturn<T> {
  data?: T;
  error?: Error;
  loading: boolean;
  run: (...args: any[]) => Promise<T>;
  setState: (setter: (data: T) => T) => Promise<void>;
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

  const setState = async (setter: (data: T) => T) => {
    const state = await setter(_.clone(response as T));
    setResponse(state);
  };

  const fetchData = async (...args: Parameters<typeof action>) => {
    let res;
    setLoading(true);

    try {
      res = await action(...args);
      options.onSuccess?.(res);
      setResponse(res);
      setLoading(false);
    } catch (error) {
      options.onError?.(error as Error);
      setLoading(false);
      throw error as Error;
    }

    return res as T;
  };

  useEffect(() => {
    if (!options.manual) {
      fetchData();
    }
  }, []);

  return {
    data: response,
    setState,
    run: fetchData,
    loading,
  };
}

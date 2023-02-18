import { useEffect, useState } from 'react';
import _ from 'lodash';
import { EventEmitter } from 'stream';

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

export interface UseRequestOptions<T> {
  manual?: boolean;
  cacheKey?: string;
  cacheTime?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  throwable?: boolean;
}

interface CacheObject {
  timestamp: number;
  cacheTime: number;
  data: unknown;
}

const cacheKeysOfRequest = new Map<string, CacheObject>();
const eventBus = new EventEmitter();
const DEFAULT_CACHE_TIME = 5 * 60e3;

/* clear cache every 5 minutes to avoid memory overflow */
setInterval(() => {
  const now = Date.now();
  cacheKeysOfRequest.forEach((value, key) => {
    if (now - value.timestamp > value.cacheTime) {
      cacheKeysOfRequest.delete(key);
    }
  });
}, DEFAULT_CACHE_TIME);

export function useRequest<T> (
  action: (...args: any[]) => Promise<T>,
  options: UseRequestOptions<T> = {
    manual: false,
    cacheKey: '',
    cacheTime: DEFAULT_CACHE_TIME,
  },
) {
  const [response, setResponse] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const cacheTime = options.cacheTime ?? DEFAULT_CACHE_TIME;
  const cacheKey = options.cacheKey;

  const setState = async (setter: (data: T) => T) => {
    const state = await setter(_.clone(response as T));
    setResponse(state);
  };

  const cachedAction = async (args: Parameters<typeof action>, func: typeof action) => {
    if (cacheKey) { // cache logic
      if (cacheKeysOfRequest.has(cacheKey)) { // cache hit
        const cachedData = cacheKeysOfRequest.get(cacheKey);
        const timestamp = cachedData?.timestamp ?? 0;
        const now = Date.now();

        if (timestamp && (now - timestamp < cacheTime)) { // cache valid - return cached data
          return cachedData?.data as unknown as T;
        } else { // cache invalid - update cache and wait on event
          cacheKeysOfRequest.set(cacheKey, {
            ...(cachedData ?? { data: undefined, cacheTime }),
            timestamp: 0,
          });
          return new Promise<T>((resolve) => {
            eventBus.once(`useRequest:cache:${cacheKey}`, (args: any) => {
              resolve(args);
            });
          });
        }

      } else { // cache miss - add cache
        cacheKeysOfRequest.set(cacheKey, {
          timestamp: 0,
          cacheTime,
          data: undefined,
        });
      }
    }

    const data = await func(...args);

    if (cacheKey) { // update cache
      cacheKeysOfRequest.set(cacheKey, {
        timestamp: Date.now(),
        cacheTime,
        data,
      });
      eventBus.emit(`useRequest:cache:${cacheKey}`, data);
    }

    return data;
  };

  const fetchData = async (...args: Parameters<typeof action>) => {
    let res;
    setLoading(true);

    try {
      res = await cachedAction(args, action);
      options.onSuccess?.(res);
      setResponse(res);
      setLoading(false);
    } catch (error) {
      options.onError?.(error as Error);
      setLoading(false);
      if (options.throwable) {
        throw error as Error;
      }
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

export default useRequest;

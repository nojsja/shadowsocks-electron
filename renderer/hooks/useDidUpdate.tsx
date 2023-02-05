import { useEffect, useRef } from 'react';

export const useDidUpdate = (effect: React.EffectCallback, deps?: React.DependencyList | undefined) => {
  const initSymbol = useRef<boolean>(false);

  useEffect(() => {
    if (!initSymbol.current) {
      initSymbol.current = true;
    } else {
      effect();
    }
  }, deps);
};

export default useDidUpdate;

import { useLayoutEffect, useRef } from "react";

const useLayoutDidUpdate = (effect: React.EffectCallback, deps?: React.DependencyList | undefined) => {
  const initSymbol = useRef<boolean|null>(null);

  useLayoutEffect(() => {
    if (!initSymbol.current) {
      initSymbol.current = true;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

export default useLayoutDidUpdate;
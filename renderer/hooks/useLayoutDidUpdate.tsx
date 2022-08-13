import { useLayoutEffect, useRef } from "react";

const useLayoutDidUpdate = (effect: React.EffectCallback, deps?: React.DependencyList | undefined) => {
  const initSymbol = useRef<boolean|null>(null);

  useLayoutEffect(() => {
    if (!initSymbol.current) {
      initSymbol.current = true;
    } else {
      effect();
    }
  }, deps);
};

export default useLayoutDidUpdate;
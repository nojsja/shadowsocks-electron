import { useEffect, useRef } from "react";

export default (effect: React.EffectCallback, deps?: React.DependencyList | undefined) => {
  const initSymbol = useRef<boolean|null>(null);

  useEffect(() => {
    if (!initSymbol.current) {
      initSymbol.current = true;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

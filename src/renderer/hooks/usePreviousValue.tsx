import { useEffect, useRef, useState } from 'react';

export const usePreviousValue = (value: unknown) => {
  const [previousValue, setPreviousValue] = useState<unknown>(null);
  const currentValue = useRef<unknown>(value);

  useEffect(() => {
    if (currentValue.current !== value) {
      setPreviousValue(currentValue.current);
      currentValue.current = value;
    }
  }, [value]);

  return previousValue;
};

export default usePreviousValue;

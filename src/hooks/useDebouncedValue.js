import { useEffect, useState } from "react";

/**
 * Returns a debounced version of `value` that updates after `delay` ms.
 */
export default function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

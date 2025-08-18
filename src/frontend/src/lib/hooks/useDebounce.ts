import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing values
 * 
 * Delays updating the debounced value until after the specified delay
 * has passed since the last time the value changed.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * ```typescript
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Perform search
 *   }
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}

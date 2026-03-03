import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of no changes. Prevents firing API calls
 * or expensive re-renders on every keystroke.
 */
export default function useDebounce(value, delay = 300) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

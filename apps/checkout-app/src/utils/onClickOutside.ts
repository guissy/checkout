import { useEffect } from 'react';

/**
 * Hook that detects clicks outside of the specified element and triggers the handler.
 *
 * @param ref - The ref of the element to detect outside clicks for.
 * @param handler - The function to call when an outside click is detected.
 */
const useClickOutside = (
  ref: React.RefObject<HTMLElement | null>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref?.current;
      // Do nothing if clicking ref's element or its descendants
      if (!el || el.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    // Bind the event listener
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

export default useClickOutside;

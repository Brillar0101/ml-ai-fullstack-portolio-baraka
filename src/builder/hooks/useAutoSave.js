import { useEffect, useRef, useCallback } from 'react';
import { useEditor } from '@craftjs/core';

export function useAutoSave(onSave, delay = 3000) {
  const { query } = useEditor();
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef('');

  const checkAndSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        const currentState = query.serialize();
        if (currentState !== lastSavedRef.current) {
          lastSavedRef.current = currentState;
          onSave(currentState);
        }
      } catch {
        // Editor not ready yet
      }
    }, delay);
  }, [query, onSave, delay]);

  useEffect(() => {
    // Listen for changes via polling (Craft.js doesn't have a perfect change subscription)
    const interval = setInterval(checkAndSave, delay);
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkAndSave, delay]);

  return { checkAndSave };
}

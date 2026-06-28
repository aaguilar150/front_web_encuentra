import { useState } from 'react';

const LOCATIONS_KEY = 'ven_saved_locations';

export function useSavedLocations() {
  const [locations, setLocations] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(LOCATIONS_KEY) || '[]');
    } catch {
      return [];
    }
  });

  const persist = (updater: (current: string[]) => string[]) => {
    setLocations((current) => {
      const next = updater(current);
      localStorage.setItem(LOCATIONS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const remember = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    persist((current) => {
      const deduped = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...deduped].slice(0, 10);
    });
  };

  const forget = (value: string) => {
    persist((current) => current.filter((item) => item !== value));
  };

  return {
    locations,
    remember,
    forget,
  };
}

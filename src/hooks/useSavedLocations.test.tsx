import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSavedLocations } from './useSavedLocations';

describe('useSavedLocations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores unique trimmed locations and keeps the newest first', () => {
    const { result } = renderHook(() => useSavedLocations());

    act(() => {
      result.current.remember('  Plaza Bolívar  ');
      result.current.remember('Catia');
      result.current.remember('plaza bolívar');
    });

    expect(result.current.locations).toEqual(['plaza bolívar', 'Catia']);
    expect(JSON.parse(localStorage.getItem('ven_saved_locations') || '[]')).toEqual(['plaza bolívar', 'Catia']);
  });

  it('forgets a saved location', () => {
    const { result } = renderHook(() => useSavedLocations());

    act(() => {
      result.current.remember('Petare');
      result.current.remember('La Guaira');
      result.current.forget('Petare');
    });

    expect(result.current.locations).toEqual(['La Guaira']);
  });
});

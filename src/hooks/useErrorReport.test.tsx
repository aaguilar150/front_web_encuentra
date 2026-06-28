import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useErrorReport } from './useErrorReport';

describe('useErrorReport', () => {
  it('opens with a clean state and closes cleanly', () => {
    const report = vi.fn();
    const { result } = renderHook(() => useErrorReport(report));

    act(() => {
      result.current.setErrorText('old');
      result.current.openModal();
    });

    expect(result.current.isOpen).toBe(true);
    expect(result.current.errorText).toBe('');
    expect(result.current.sendError).toBeNull();
    expect(result.current.sent).toBe(false);

    act(() => {
      result.current.closeModal();
    });

    expect(result.current.isOpen).toBe(false);
  });

  it('submits successfully and resets the draft', async () => {
    const report = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useErrorReport(report));

    act(() => {
      result.current.openModal();
      result.current.setErrorText('Hay un problema');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(report).toHaveBeenCalledWith('Hay un problema');
    expect(result.current.sent).toBe(true);
    expect(result.current.errorText).toBe('');
    expect(result.current.sendError).toBeNull();
  });

  it('keeps the modal usable when the request fails', async () => {
    const report = vi.fn().mockRejectedValue(new Error('fallo backend'));
    const { result } = renderHook(() => useErrorReport(report));

    act(() => {
      result.current.openModal();
      result.current.setErrorText('Hay un problema');
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.sent).toBe(false);
    expect(result.current.sendError).toBe('fallo backend');
    expect(result.current.sending).toBe(false);
    expect(result.current.errorText).toBe('Hay un problema');
  });
});

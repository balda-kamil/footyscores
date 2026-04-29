import { renderHook, act } from '@testing-library/react';
import { useClipboard } from '@/hooks/useClipboard';

describe('useClipboard', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    (navigator.clipboard.writeText as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('initialises with copied=false', () => {
    const { result } = renderHook(() => useClipboard());
    expect(result.current.copied).toBe(false);
  });

  it('sets copied=true after calling copy', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    expect(result.current.copied).toBe(true);
  });

  it('calls navigator.clipboard.writeText with the given text', async () => {
    const { result } = renderHook(() => useClipboard());
    await act(async () => {
      result.current.copy('test-text');
      await Promise.resolve();
    });
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test-text');
  });

  it('resets copied to false after the timeout', async () => {
    const { result } = renderHook(() => useClipboard(1500));
    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1500);
    });
    expect(result.current.copied).toBe(false);
  });

  it('uses a custom timeout', async () => {
    const { result } = renderHook(() => useClipboard(500));
    await act(async () => {
      result.current.copy('hello');
      await Promise.resolve();
    });
    act(() => {
      jest.advanceTimersByTime(499);
    });
    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current.copied).toBe(false);
  });
});

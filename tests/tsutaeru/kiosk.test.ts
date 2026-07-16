import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLongPress } from '~/apps/tsutaeru/kiosk';

describe('createLongPress', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('fires onComplete after the full duration is held without moving', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    vi.advanceTimersByTime(2999);
    expect(onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('does not fire when released (cancel) before the duration — a short tap', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    vi.advanceTimersByTime(150);
    lp.cancel(); // pointerup
    vi.advanceTimersByTime(5000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('aborts when the pointer moves beyond the threshold', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    lp.move(20, 0); // >10px
    vi.advanceTimersByTime(5000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('tolerates small jitter within the threshold', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    lp.move(5, 5); // hypot ~7.07 < 10
    vi.advanceTimersByTime(3000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('ignores moves after the timer already resolved or was cancelled', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    lp.cancel();
    lp.move(100, 100); // no active timer — must not throw
    vi.advanceTimersByTime(3000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('restarts the timer on a fresh press', () => {
    const onComplete = vi.fn();
    const lp = createLongPress({ durationMs: 3000, moveThreshold: 10, onComplete });

    lp.start(0, 0);
    vi.advanceTimersByTime(2000);
    lp.start(50, 50); // new press resets the clock
    vi.advanceTimersByTime(2000);
    expect(onComplete).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});

/**
 * Long-press detector for exiting 本人モード (kiosk mode).
 *
 * Pure timing/threshold logic decoupled from the DOM so it is testable under
 * vitest with fake timers: the caller feeds it pointer coordinates and lifts,
 * it fires `onComplete` only when a press is held for `durationMs` without
 * moving more than `moveThreshold` pixels. Any move past the threshold, or a
 * `cancel()` (pointerup / pointercancel), aborts the pending timer — so normal
 * short card taps never trigger an exit.
 */
export interface LongPressOptions {
  durationMs: number;
  moveThreshold: number;
  onComplete: () => void;
}

export interface LongPress {
  start(x: number, y: number): void;
  move(x: number, y: number): void;
  cancel(): void;
}

export function createLongPress(opts: LongPressOptions): LongPress {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;

  function cancel(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function start(x: number, y: number): void {
    cancel();
    startX = x;
    startY = y;
    timer = setTimeout(() => {
      timer = null;
      opts.onComplete();
    }, opts.durationMs);
  }

  function move(x: number, y: number): void {
    if (timer === null) return;
    if (Math.hypot(x - startX, y - startY) > opts.moveThreshold) cancel();
  }

  return { start, move, cancel };
}

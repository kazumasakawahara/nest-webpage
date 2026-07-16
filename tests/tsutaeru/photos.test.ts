import { describe, it, expect } from 'vitest';
import { fitSize } from '~/apps/tsutaeru/photos';

// Only the pure resize math is unit-tested here. The IndexedDB / canvas paths
// need a real browser (indexedDB, canvas, object URLs) and are verified
// manually — the brief forbids fake-indexeddb.
describe('fitSize', () => {
  it('shrinks a landscape image so the long side (width) hits max', () => {
    expect(fitSize(1600, 900, 800)).toEqual({ w: 800, h: 450 });
  });
  it('shrinks a portrait image so the long side (height) hits max', () => {
    expect(fitSize(900, 1600, 800)).toEqual({ w: 450, h: 800 });
  });
  it('never upscales an image smaller than max', () => {
    expect(fitSize(400, 300, 800)).toEqual({ w: 400, h: 300 });
  });
  it('leaves an image whose long side is exactly max unchanged', () => {
    expect(fitSize(800, 600, 800)).toEqual({ w: 800, h: 600 });
  });
  it('rounds fractional dimensions to whole pixels', () => {
    // 1000 long side → scale 0.8; 333 * 0.8 = 266.4 → 266
    expect(fitSize(1000, 333, 800)).toEqual({ w: 800, h: 266 });
  });
});

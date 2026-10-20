import { describe, it, expect } from 'vitest';
import { MAX_LONG_SIDE, fitSize } from '~/apps/reitouko/photos';

// 純粋な縮小計算だけを検証する。IndexedDB／canvas は実機で確かめる。
describe('fitSize', () => {
  it('長辺を max に合わせて縮める', () => {
    expect(fitSize(1600, 900, 640)).toEqual({ w: 640, h: 360 });
    expect(fitSize(900, 1600, 640)).toEqual({ w: 360, h: 640 });
  });
  it('拡大はしない', () => {
    expect(fitSize(400, 300, 640)).toEqual({ w: 400, h: 300 });
  });
  it('既定の長辺は 640', () => {
    expect(MAX_LONG_SIDE).toBe(640);
  });
});

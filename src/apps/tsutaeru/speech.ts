import { loadSettings } from './store';

/**
 * Read a card's text aloud with the Web Speech API (Japanese voice).
 *
 * Silently no-ops when speech is disabled in settings, or when the API is
 * unavailable (SSR/build, or a browser without speechSynthesis). Nothing here
 * touches `window`/`speechSynthesis` at module load — Astro builds this file,
 * so the API is only ever read inside the call, guarded by feature checks.
 *
 * `cancel()` is called first so a rapid sequence of taps interrupts the
 * previous utterance instead of queueing.
 */
export function speak(text: string): void {
  if (loadSettings().speech !== true) return;
  const synth = globalThis.speechSynthesis as SpeechSynthesis | undefined;
  if (synth == null || typeof SpeechSynthesisUtterance !== 'function') return;

  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP';
  synth.speak(utterance);
}

import { createSession, tap, type Session } from './flow';
import { createLongPress } from './kiosk';
import { speak } from './speech';
import { addHistory, loadThemes } from './store';
import type { Theme } from './types';
import {
  buildHistoryEntry,
  renderCards,
  renderHome,
  renderResult,
  renderSupport,
  showToast,
} from './ui/screens';

type Screen =
  | { name: 'home' }
  | { name: 'cards'; session: Session }
  | { name: 'result'; session: Session }
  | { name: 'support' };

export function initApp(root: HTMLElement): void {
  const themes = loadThemes();
  let screen: Screen = { name: 'home' };
  // 本人モード (kiosk). In-memory only: a page reload exits it.
  let kiosk = false;

  function go(next: Screen): void {
    screen = next;
    render();
  }

  function enableKiosk(): void {
    kiosk = true;
    render();
  }

  function exitKiosk(): void {
    if (!kiosk) return;
    kiosk = false;
    render();
    showToast('ほんにんモードを かいじょしました');
  }

  // Long-press anywhere exits kiosk mode. Listeners live on the persistent root
  // (survives re-renders) and only arm the timer while kiosk is on, so normal
  // short card taps are never affected.
  const longPress = createLongPress({
    durationMs: 3000,
    moveThreshold: 10,
    onComplete: exitKiosk,
  });
  root.addEventListener('pointerdown', (e) => {
    if (kiosk) longPress.start(e.clientX, e.clientY);
  });
  root.addEventListener('pointermove', (e) => {
    if (kiosk) longPress.move(e.clientX, e.clientY);
  });
  root.addEventListener('pointerup', () => longPress.cancel());
  root.addEventListener('pointercancel', () => longPress.cancel());

  function selectTheme(theme: Theme): void {
    go({ name: 'cards', session: createSession(theme) });
  }

  function onTap(cardId: string): void {
    if (screen.name !== 'cards') return;
    const before = screen.session;
    // A card's FIRST tap sets it pending; that card is read aloud once. The
    // commit tap (same card already pending) advances silently.
    const spokenCard =
      before.pending?.id !== cardId
        ? before.queue[before.index]?.cards.find((c) => c.id === cardId)
        : undefined;

    const next = tap(before, cardId);
    if (next.done) {
      // Reaching done commits exactly one history entry, then shows result.
      addHistory(buildHistoryEntry(next, new Date().toISOString(), crypto.randomUUID()));
      go({ name: 'result', session: next });
    } else {
      go({ name: 'cards', session: next });
    }

    // Speak last: the visual state (pending outline / advance) has already been
    // committed, so audio never blocks or delays the tap's feedback.
    if (spokenCard) speak(spokenCard.speech ?? spokenCard.label);
  }

  function render(): void {
    root.textContent = '';
    switch (screen.name) {
      case 'home':
        renderHome(root, {
          themes,
          kiosk,
          onSelectTheme: selectTheme,
          onOpenSupport: () => go({ name: 'support' }),
          onEnableKiosk: enableKiosk,
        });
        break;
      case 'cards':
        renderCards(root, {
          session: screen.session,
          kiosk,
          onTap,
          onBack: () => go({ name: 'home' }),
        });
        break;
      case 'result': {
        const { theme } = screen.session;
        renderResult(root, {
          session: screen.session,
          onAgain: () => selectTheme(theme),
          onHome: () => go({ name: 'home' }),
        });
        break;
      }
      case 'support':
        renderSupport(root, () => go({ name: 'home' }));
        break;
    }
  }

  render();
}

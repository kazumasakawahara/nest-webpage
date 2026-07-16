import { createSession, tap, type Session } from './flow';
import { addHistory, loadThemes } from './store';
import type { Theme } from './types';
import {
  buildHistoryEntry,
  renderCards,
  renderHome,
  renderResult,
  renderSupport,
} from './ui/screens';

type Screen =
  | { name: 'home' }
  | { name: 'cards'; session: Session }
  | { name: 'result'; session: Session }
  | { name: 'support' };

export function initApp(root: HTMLElement): void {
  const themes = loadThemes();
  let screen: Screen = { name: 'home' };

  function go(next: Screen): void {
    screen = next;
    render();
  }

  function selectTheme(theme: Theme): void {
    go({ name: 'cards', session: createSession(theme) });
  }

  function onTap(cardId: string): void {
    if (screen.name !== 'cards') return;
    const next = tap(screen.session, cardId);
    if (next.done) {
      // Reaching done commits exactly one history entry, then shows result.
      addHistory(buildHistoryEntry(next, new Date().toISOString(), crypto.randomUUID()));
      go({ name: 'result', session: next });
    } else {
      go({ name: 'cards', session: next });
    }
  }

  function render(): void {
    root.textContent = '';
    switch (screen.name) {
      case 'home':
        renderHome(root, {
          themes,
          onSelectTheme: selectTheme,
          onOpenSupport: () => go({ name: 'support' }),
        });
        break;
      case 'cards':
        renderCards(root, {
          session: screen.session,
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

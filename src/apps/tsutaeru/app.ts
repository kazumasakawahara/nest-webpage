import { formatEntries } from './export';
import { createSession, tap, type Session } from './flow';
import { filterByPeriod, type Period } from './history';
import { createLongPress } from './kiosk';
import { deletePhoto } from './photos';
import { speak } from './speech';
import {
  addHistory,
  clearHistory,
  deleteHistory,
  listHistory,
  loadThemes,
  saveThemes,
  setHistoryMark,
} from './store';
import {
  addCard,
  addTheme,
  editCardField,
  moveCard,
  moveTheme,
  restorePreset,
  setCardPhoto,
  setThemeDisplay,
  toggleCardHidden,
  toggleQuestionEnabled,
  toggleQuestionEscape,
  toggleQuestionShuffle,
  toggleThemeHidden,
} from './editor';
import type { Display, Theme } from './types';
import {
  buildHistoryEntry,
  renderCards,
  renderHome,
  renderResult,
  renderSupport,
  showToast,
  type SupportTab,
} from './ui/screens';

type Screen =
  | { name: 'home' }
  | { name: 'cards'; session: Session }
  | { name: 'result'; session: Session }
  | { name: 'support' };

export function initApp(root: HTMLElement): void {
  // Mutable: editor mutations reassign this and persist via saveThemes(), so
  // the home grid (which reads `themes`) reflects saved edits on return.
  let themes = loadThemes();
  let screen: Screen = { name: 'home' };
  // 本人モード (kiosk). In-memory only: a page reload exits it.
  let kiosk = false;

  // 支援者ゾーン sub-state (in-memory; reset each time the zone is entered).
  let supportTab: SupportTab = 'history';
  let supportPeriod: Period = 'all';
  let confirmingClear = false;
  let editingMarkId: string | null = null;

  // へんしゅう (editor) sub-state.
  let openThemeId: string | null = null;
  let addingTheme = false;
  let addingCardQ: string | null = null;
  let editingCardId: string | null = null;
  let confirmingRestore = false;

  function resetEditState(): void {
    openThemeId = null;
    addingTheme = false;
    addingCardQ = null;
    editingCardId = null;
    confirmingRestore = false;
  }

  // Apply a pure editor mutation, persist, and re-render.
  function commitThemes(next: Theme[]): void {
    themes = next;
    saveThemes(themes);
    render();
  }

  function go(next: Screen): void {
    screen = next;
    render();
  }

  function openSupport(): void {
    supportTab = 'history';
    supportPeriod = 'all';
    confirmingClear = false;
    editingMarkId = null;
    resetEditState();
    go({ name: 'support' });
  }

  async function copyHistory(): Promise<void> {
    const text = formatEntries(filterByPeriod(listHistory(), supportPeriod, new Date()));
    try {
      if (!navigator.clipboard) throw new Error('clipboard API unavailable');
      await navigator.clipboard.writeText(text);
      showToast('コピーしました');
    } catch {
      // Never let a clipboard rejection throw out of the screen; always tell
      // the supporter it failed rather than failing silently.
      showToast('コピーできませんでした');
    }
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
          onOpenSupport: openSupport,
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
        renderSupport(root, {
          entries: listHistory(),
          tab: supportTab,
          period: supportPeriod,
          confirmingClear,
          editingMarkId,
          edit: {
            themes,
            openThemeId,
            addingTheme,
            addingCardQ,
            editingCardId,
            confirmingRestore,
            onOpenTheme: (id) => {
              openThemeId = id;
              addingCardQ = null;
              editingCardId = null;
              confirmingRestore = false;
              render();
            },
            onBackToList: () => {
              openThemeId = null;
              addingCardQ = null;
              editingCardId = null;
              confirmingRestore = false;
              render();
            },
            onToggleThemeHidden: (id) => commitThemes(toggleThemeHidden(themes, id)),
            onMoveTheme: (id, dir) => commitThemes(moveTheme(themes, id, dir)),
            onSetDisplay: (id, display: Display) => commitThemes(setThemeDisplay(themes, id, display)),
            onAddThemeStart: () => {
              addingTheme = true;
              render();
            },
            onAddThemeCancel: () => {
              addingTheme = false;
              render();
            },
            onAddThemeSave: (title, prompt) => {
              addingTheme = false;
              commitThemes(
                addTheme(themes, {
                  id: crypto.randomUUID(),
                  title,
                  prompt,
                  questionId: crypto.randomUUID(),
                }),
              );
            },
            onToggleEnabled: (qid) => commitThemes(toggleQuestionEnabled(themes, openThemeId!, qid)),
            onToggleEscape: (qid) => commitThemes(toggleQuestionEscape(themes, openThemeId!, qid)),
            onToggleShuffle: (qid) => commitThemes(toggleQuestionShuffle(themes, openThemeId!, qid)),
            onEditCardStart: (cardId) => {
              editingCardId = cardId;
              addingCardQ = null;
              render();
            },
            onEditCardCancel: () => {
              editingCardId = null;
              render();
            },
            onEditCardSave: (qid, cardId, label, speech) => {
              editingCardId = null;
              let next = editCardField(themes, openThemeId!, qid, cardId, 'label', label);
              next = editCardField(next, openThemeId!, qid, cardId, 'speech', speech);
              commitThemes(next);
            },
            onSetCardPhoto: (qid, cardId, photoId) =>
              commitThemes(setCardPhoto(themes, openThemeId!, qid, cardId, photoId)),
            onRemoveCardPhoto: (qid, cardId, photoId) => {
              // Drop the stored blob (fire-and-forget) then clear the reference.
              void deletePhoto(photoId);
              commitThemes(setCardPhoto(themes, openThemeId!, qid, cardId, null));
            },
            onToggleCardHidden: (qid, cardId) =>
              commitThemes(toggleCardHidden(themes, openThemeId!, qid, cardId)),
            onMoveCard: (qid, cardId, dir) =>
              commitThemes(moveCard(themes, openThemeId!, qid, cardId, dir)),
            onAddCardStart: (qid) => {
              addingCardQ = qid;
              editingCardId = null;
              render();
            },
            onAddCardCancel: () => {
              addingCardQ = null;
              render();
            },
            onAddCardSave: (qid, label, art) => {
              addingCardQ = null;
              commitThemes(
                addCard(themes, openThemeId!, qid, {
                  id: crypto.randomUUID(),
                  label,
                  art: art ?? undefined,
                }),
              );
            },
            onRequestRestore: () => {
              confirmingRestore = true;
              render();
            },
            onCancelRestore: () => {
              confirmingRestore = false;
              render();
            },
            onConfirmRestore: (id) => {
              confirmingRestore = false;
              commitThemes(restorePreset(themes, id));
            },
          },
          onBack: () => go({ name: 'home' }),
          onTab: (t) => {
            supportTab = t;
            confirmingClear = false;
            editingMarkId = null;
            resetEditState();
            render();
          },
          onPeriod: (p) => {
            supportPeriod = p;
            render();
          },
          onCopy: copyHistory,
          onDelete: (id) => {
            deleteHistory(id);
            if (editingMarkId === id) editingMarkId = null;
            render();
          },
          onRequestClear: () => {
            confirmingClear = true;
            render();
          },
          onCancelClear: () => {
            confirmingClear = false;
            render();
          },
          onConfirmClear: () => {
            clearHistory();
            confirmingClear = false;
            editingMarkId = null;
            render();
            showToast('ぜんぶ 消しました');
          },
          onEditMark: (id) => {
            editingMarkId = id;
            render();
          },
          onSaveMark: (id, mark) => {
            setHistoryMark(id, mark);
            editingMarkId = null;
            render();
          },
        });
        break;
    }
  }

  render();
}

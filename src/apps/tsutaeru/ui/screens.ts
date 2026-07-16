import type { Session } from '../flow';
import { currentQuestion } from '../flow';
import { filterByPeriod, formatRow, type Period } from '../history';
import type { Card, HistoryEntry, Theme } from '../types';

const ART_BASE = '/apps/tsutaeru/art';

// Small DOM helper: create an element, optionally with a class and text.
// textContent (never innerHTML) keeps user-supplied labels safe.
function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function artImg(artId: string): HTMLImageElement {
  const img = el('img', 'art');
  img.src = `${ART_BASE}/${artId}.svg`;
  img.alt = '';
  return img;
}

// Escape cards keep their _none/_unknown ids in picks but paint esc-* art;
// every preset card mirrors its id into art (presets.ts `c`), so id === art.
function artIdForCard(cardId: string): string {
  if (cardId === '_none') return 'esc-none';
  if (cardId === '_unknown') return 'esc-unknown';
  return cardId;
}

/**
 * Pure: fold a finished session into a persistable HistoryEntry. `now` (ISO
 * string) and `uuid` are injected so callers control clock/identity and tests
 * stay deterministic.
 */
export function buildHistoryEntry(session: Session, now: string, uuid: string): HistoryEntry {
  return {
    id: uuid,
    at: now,
    themeId: session.theme.id,
    themeTitle: session.theme.title,
    picks: session.picks.map((p) => ({ ...p })),
  };
}

export interface HomeCtx {
  themes: Theme[];
  kiosk: boolean;
  onSelectTheme(theme: Theme): void;
  onOpenSupport(): void;
  onEnableKiosk(): void;
}

export function renderHome(root: HTMLElement, ctx: HomeCtx): void {
  const screen = el('div', 'screen');

  const bar = el('header', 'app-bar');
  bar.appendChild(el('span', 'app-title', 'つたえるカード'));
  // In 本人モード the gear is the escape hatch to the support zone, so hide it.
  if (!ctx.kiosk) {
    const gear = el('button', 'gear');
    gear.type = 'button';
    gear.setAttribute('aria-label', '支援者ゾーン');
    gear.textContent = '⚙';
    gear.addEventListener('click', () => ctx.onOpenSupport());
    bar.appendChild(gear);
  }
  screen.appendChild(bar);

  // 本人モード control. OFF: a toggle that turns it on. ON: a static badge —
  // no tap can leave kiosk mode; exit is the 3-second long-press only.
  const kioskRow = el('div', 'kiosk-row');
  if (ctx.kiosk) {
    kioskRow.appendChild(el('span', 'kiosk-badge', 'ほんにんモード'));
    kioskRow.appendChild(el('span', 'kiosk-hint', 'かいじょは がめんを 3びょう ながおし'));
  } else {
    const toggle = el('button', 'kiosk-toggle', 'ほんにんモード');
    toggle.type = 'button';
    toggle.addEventListener('click', () => ctx.onEnableKiosk());
    kioskRow.appendChild(toggle);
    kioskRow.appendChild(el('span', 'kiosk-hint', 'せっていボタンを かくします'));
  }
  screen.appendChild(kioskRow);

  const grid = el('div', 'theme-grid');
  for (const theme of ctx.themes) {
    if (theme.hidden === true) continue;
    const btn = el('button', 'theme-btn');
    btn.type = 'button';
    btn.appendChild(artImg(theme.icon));
    btn.appendChild(el('span', 'theme-title', theme.title));
    btn.addEventListener('click', () => ctx.onSelectTheme(theme));
    grid.appendChild(btn);
  }
  screen.appendChild(grid);

  root.appendChild(screen);
}

export interface CardsCtx {
  session: Session;
  kiosk: boolean;
  onTap(cardId: string): void;
  onBack(): void;
}

export function renderCards(root: HTMLElement, ctx: CardsCtx): void {
  const { session } = ctx;
  const question = currentQuestion(session);
  if (!question) return;

  const screen = el('div', 'screen');

  const bar = el('header', 'card-bar');
  // Back is offered only on the first question (abandons the session → home).
  // Later questions have no back — the design gives no mid-session undo.
  // In 本人モード it is hidden too: no route back to home escape.
  if (session.index === 0 && !ctx.kiosk) {
    const back = el('button', 'back');
    back.type = 'button';
    back.setAttribute('aria-label', 'もどる');
    back.textContent = '←';
    back.addEventListener('click', () => ctx.onBack());
    bar.appendChild(back);
  }
  screen.appendChild(bar);

  screen.appendChild(el('p', 'prompt', question.prompt));

  const display = session.theme.display;
  const grid = el('div', 'card-grid');
  for (const card of question.cards) {
    grid.appendChild(cardButton(card, display, session.pending?.id === card.id, ctx.onTap));
  }
  screen.appendChild(grid);

  root.appendChild(screen);
}

// 'text' → label only (larger); 'art'/'photo' → art image + label.
// 'photo' falls back to art until photo rendering lands (Task 10).
function cardButton(
  card: Card,
  display: Theme['display'],
  selected: boolean,
  onTap: (cardId: string) => void,
): HTMLButtonElement {
  const btn = el('button', 'card-btn');
  btn.type = 'button';
  if (display === 'text') btn.classList.add('text');
  if (selected) btn.classList.add('selected');
  if (display !== 'text') {
    btn.appendChild(artImg(card.art ?? artIdForCard(card.id)));
  }
  btn.appendChild(el('span', 'card-label', card.label));
  btn.addEventListener('click', () => onTap(card.id));
  return btn;
}

export interface ResultCtx {
  session: Session;
  onAgain(): void;
  onHome(): void;
}

export function renderResult(root: HTMLElement, ctx: ResultCtx): void {
  const { session } = ctx;
  const screen = el('div', 'screen');

  const row = el('div', 'result-row');
  const display = session.theme.display;
  for (const pick of session.picks) {
    const card = el('div', 'result-card');
    if (display === 'text') card.classList.add('text');
    if (display !== 'text') card.appendChild(artImg(artIdForCard(pick.cardId)));
    card.appendChild(el('span', 'card-label', pick.label));
    row.appendChild(card);
  }
  screen.appendChild(row);

  const actions = el('div', 'actions');
  const again = el('button', 'action-btn', 'もういちど');
  again.type = 'button';
  again.addEventListener('click', () => ctx.onAgain());
  const home = el('button', 'action-btn secondary', 'ホームへ');
  home.type = 'button';
  home.addEventListener('click', () => ctx.onHome());
  actions.appendChild(again);
  actions.appendChild(home);
  screen.appendChild(actions);

  root.appendChild(screen);
}

export type SupportTab = 'history' | 'edit' | 'settings';

export interface SupportCtx {
  entries: HistoryEntry[]; // full list, newest-first
  tab: SupportTab;
  period: Period;
  confirmingClear: boolean;
  editingMarkId: string | null;
  onBack(): void;
  onTab(tab: SupportTab): void;
  onPeriod(p: Period): void;
  onCopy(): void;
  onDelete(id: string): void;
  onRequestClear(): void;
  onCancelClear(): void;
  onConfirmClear(): void;
  onEditMark(id: string): void;
  onSaveMark(id: string, mark: string): void;
}

// 支援者ゾーン. Tabs りれき／へんしゅう／せってい. Only りれき is real here;
// the other two show a placeholder pane filled in by later tasks.
export function renderSupport(root: HTMLElement, ctx: SupportCtx): void {
  const screen = el('div', 'screen');

  const bar = el('header', 'card-bar');
  const back = el('button', 'back');
  back.type = 'button';
  back.setAttribute('aria-label', 'もどる');
  back.textContent = '←';
  back.addEventListener('click', () => ctx.onBack());
  bar.appendChild(back);
  bar.appendChild(el('span', 'support-title', '支援者ゾーン'));
  screen.appendChild(bar);

  const tabs = el('div', 'support-tabs');
  const tabDefs: [SupportTab, string][] = [
    ['history', 'りれき'],
    ['edit', 'へんしゅう'],
    ['settings', 'せってい'],
  ];
  for (const [id, label] of tabDefs) {
    const t = el('button', 'support-tab', label);
    t.type = 'button';
    if (ctx.tab === id) t.classList.add('active');
    t.addEventListener('click', () => ctx.onTab(id));
    tabs.appendChild(t);
  }
  screen.appendChild(tabs);

  if (ctx.tab === 'history') {
    renderHistoryPane(screen, ctx);
  } else {
    screen.appendChild(el('p', 'note', 'じゅんびちゅう'));
  }

  root.appendChild(screen);
}

function renderHistoryPane(screen: HTMLElement, ctx: SupportCtx): void {
  const periodRow = el('div', 'period-row');
  const periodDefs: [Period, string][] = [
    ['today', 'きょう'],
    ['7days', '7日'],
    ['all', 'ぜんぶ'],
  ];
  for (const [id, label] of periodDefs) {
    const b = el('button', 'period-btn', label);
    b.type = 'button';
    if (ctx.period === id) b.classList.add('active');
    b.addEventListener('click', () => ctx.onPeriod(id));
    periodRow.appendChild(b);
  }
  screen.appendChild(periodRow);

  // Impure boundary: the clock enters here; the pure filter takes `now`.
  const filtered = filterByPeriod(ctx.entries, ctx.period, new Date());

  const copy = el('button', 'copy-btn', 'コピーする');
  copy.type = 'button';
  copy.addEventListener('click', () => ctx.onCopy());
  screen.appendChild(copy);

  if (filtered.length === 0) {
    screen.appendChild(el('p', 'support-empty', 'きろくは まだありません'));
  } else {
    const list = el('div', 'history-list');
    for (const e of filtered) list.appendChild(historyRow(e, ctx));
    screen.appendChild(list);
  }

  // 全削除: two-step confirm, in-page (no window.confirm).
  const clearWrap = el('div', 'clear-row');
  if (ctx.confirmingClear) {
    clearWrap.appendChild(el('span', 'clear-confirm-text', 'ぜんぶ 消しますか？'));
    const yes = el('button', 'clear-btn danger', '消す');
    yes.type = 'button';
    yes.addEventListener('click', () => ctx.onConfirmClear());
    const no = el('button', 'clear-btn', 'やめる');
    no.type = 'button';
    no.addEventListener('click', () => ctx.onCancelClear());
    clearWrap.appendChild(yes);
    clearWrap.appendChild(no);
  } else {
    const clear = el('button', 'clear-btn', '全削除');
    clear.type = 'button';
    if (ctx.entries.length === 0) clear.disabled = true;
    clear.addEventListener('click', () => ctx.onRequestClear());
    clearWrap.appendChild(clear);
  }
  screen.appendChild(clearWrap);
}

function historyRow(e: HistoryEntry, ctx: SupportCtx): HTMLElement {
  const row = el('div', 'history-row');

  const top = el('div', 'history-top');
  top.appendChild(el('span', 'history-line', formatRow(e)));
  const del = el('button', 'row-delete', '消す');
  del.type = 'button';
  del.setAttribute('aria-label', 'この きろくを 消す');
  del.addEventListener('click', () => ctx.onDelete(e.id));
  top.appendChild(del);
  row.appendChild(top);

  if (ctx.editingMarkId === e.id) {
    const editor = el('div', 'mark-editor');
    const input = el('input', 'mark-input');
    input.type = 'text';
    input.value = e.mark ?? '';
    input.placeholder = 'めじるし';
    input.setAttribute('aria-label', 'めじるし');
    input.maxLength = 40;
    const save = (): void => ctx.onSaveMark(e.id, input.value.trim());
    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault();
        save();
      }
    });
    const saveBtn = el('button', 'mark-save', 'ほぞん');
    saveBtn.type = 'button';
    saveBtn.addEventListener('click', save);
    editor.appendChild(input);
    editor.appendChild(saveBtn);
    // Privacy guardrail: this notice is visible whenever the input is.
    editor.appendChild(el('p', 'mark-note', 'ほんみょうは かかないでください'));
    row.appendChild(editor);
    setTimeout(() => input.focus(), 0);
  } else {
    const markBtn = el('button', 'mark-btn', e.mark ? `めじるし: ${e.mark}` : 'めじるし');
    markBtn.type = 'button';
    if (e.mark) markBtn.classList.add('set');
    markBtn.addEventListener('click', () => ctx.onEditMark(e.id));
    row.appendChild(markBtn);
  }

  return row;
}

// Transient bottom toast; auto-removes. Used to confirm leaving 本人モード.
export function showToast(message: string): void {
  const toast = el('div', 'toast', message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

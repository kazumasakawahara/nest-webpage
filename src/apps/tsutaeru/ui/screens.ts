import type { Session } from '../flow';
import { currentQuestion } from '../flow';
import { filterByPeriod, formatRow, type Period } from '../history';
import type { Card, Display, HistoryEntry, Question, Theme } from '../types';
import { ART_IDS } from '../art';
import { getPhotoURL, resizeToBlob, savePhoto } from '../photos';

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

// Photo image for a card. getPhotoURL is async and screens re-render by
// clearing the root, so the element can be detached before the URL resolves —
// guard with isConnected so a stale promise never throws or sets src on an
// orphan. A missing photo (null) or a storage failure (private mode, blocked
// IndexedDB) degrades to the blank placeholder — never an unhandled rejection.
function photoImg(photoId: string): HTMLImageElement {
  const img = el('img', 'photo');
  img.alt = '';
  getPhotoURL(photoId)
    .then((url) => {
      if (url && img.isConnected) img.src = url;
    })
    .catch(() => {});
  return img;
}

// The visual (photo or art) for a card, shared by the cards screen and the
// result screen. null for text-only display. Photo wins when the theme shows
// photos and the card has one; otherwise art (a photo theme can still hold
// cards nobody has attached a picture to yet).
function cardMedia(card: Card, display: Display): HTMLElement | null {
  if (display === 'text') return null;
  if (display === 'photo' && card.photoId) return photoImg(card.photoId);
  return artImg(card.art ?? artIdForCard(card.id));
}

/**
 * Pure: resolve a card id across a theme's questions. Escape-card ids
 * (_none/_unknown) live in flow.ts session views, not the theme, so they
 * resolve to undefined — callers fall back to artIdForCard.
 */
export function findCard(theme: Theme, cardId: string): Card | undefined {
  for (const q of theme.questions) {
    const card = q.cards.find((c) => c.id === cardId);
    if (card) return card;
  }
  return undefined;
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

// 'text' → label only (larger); otherwise cardMedia (photo or art) + label.
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
  const media = cardMedia(card, display);
  if (media) btn.appendChild(media);
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
    const box = el('div', 'result-card');
    if (display === 'text') box.classList.add('text');
    if (display !== 'text') {
      // Resolve the pick back to its card so photos and explicit art render
      // exactly as they did on the cards screen. Escape cards (_none/_unknown)
      // are not in the theme — fall back to their fixed art ids.
      const card = findCard(session.theme, pick.cardId);
      box.appendChild(card ? cardMedia(card, display)! : artImg(artIdForCard(pick.cardId)));
    }
    box.appendChild(el('span', 'card-label', pick.label));
    row.appendChild(box);
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
  edit: EditCtx;
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
  } else if (ctx.tab === 'edit') {
    renderEditPane(screen, ctx.edit);
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

// ── へんしゅう (editor) ────────────────────────────────────────────────────

export interface EditCtx {
  themes: Theme[];
  openThemeId: string | null; // null → theme list; else → that theme's detail
  addingTheme: boolean;
  addingCardQ: string | null; // questionId whose add-card form is open
  editingCardId: string | null;
  confirmingRestore: boolean;
  // theme list
  onOpenTheme(themeId: string): void;
  onBackToList(): void;
  onToggleThemeHidden(themeId: string): void;
  onMoveTheme(themeId: string, dir: -1 | 1): void;
  onSetDisplay(themeId: string, display: Display): void;
  onAddThemeStart(): void;
  onAddThemeCancel(): void;
  onAddThemeSave(title: string, prompt: string): void;
  // theme detail
  onToggleEnabled(questionId: string): void;
  onToggleEscape(questionId: string): void;
  onToggleShuffle(questionId: string): void;
  onEditCardStart(cardId: string): void;
  onEditCardCancel(): void;
  onEditCardSave(questionId: string, cardId: string, label: string, speech: string): void;
  onSetCardPhoto(questionId: string, cardId: string, photoId: string): void;
  onRemoveCardPhoto(questionId: string, cardId: string, photoId: string): void;
  onToggleCardHidden(questionId: string, cardId: string): void;
  onMoveCard(questionId: string, cardId: string, dir: -1 | 1): void;
  onAddCardStart(questionId: string): void;
  onAddCardCancel(): void;
  onAddCardSave(questionId: string, label: string, art: string | null): void;
  onRequestRestore(): void;
  onCancelRestore(): void;
  onConfirmRestore(themeId: string): void;
}

const DISPLAY_OPTS: [Display, string][] = [
  ['text', '文字だけ'],
  ['art', 'えとことば'],
  ['photo', 'しゃしん'],
];

function renderEditPane(screen: HTMLElement, ctx: EditCtx): void {
  if (ctx.openThemeId === null) renderThemeList(screen, ctx);
  else renderThemeDetail(screen, ctx);
}

function renderThemeList(screen: HTMLElement, ctx: EditCtx): void {
  const list = el('div', 'edit-list');
  for (const theme of ctx.themes) {
    list.appendChild(themeRow(theme, ctx));
  }
  screen.appendChild(list);

  if (ctx.addingTheme) {
    screen.appendChild(addThemeForm(ctx));
  } else {
    const add = el('button', 'edit-add-btn', 'あたらしいテーマ');
    add.type = 'button';
    add.addEventListener('click', () => ctx.onAddThemeStart());
    screen.appendChild(add);
  }
}

function themeRow(theme: Theme, ctx: EditCtx): HTMLElement {
  const row = el('div', 'edit-row');

  const top = el('div', 'edit-row-top');
  const open = el('button', 'edit-title-btn', theme.title);
  open.type = 'button';
  open.addEventListener('click', () => ctx.onOpenTheme(theme.id));
  top.appendChild(open);

  const hide = el('button', 'edit-mini', theme.hidden === true ? '非表示' : '表示');
  hide.type = 'button';
  if (theme.hidden === true) hide.classList.add('off');
  hide.addEventListener('click', () => ctx.onToggleThemeHidden(theme.id));
  top.appendChild(hide);

  top.appendChild(reorderButtons(() => ctx.onMoveTheme(theme.id, -1), () => ctx.onMoveTheme(theme.id, 1)));
  row.appendChild(top);

  const disp = el('div', 'edit-display');
  for (const [id, label] of DISPLAY_OPTS) {
    const b = el('button', 'edit-seg', label);
    b.type = 'button';
    if (theme.display === id) b.classList.add('active');
    b.addEventListener('click', () => ctx.onSetDisplay(theme.id, id));
    disp.appendChild(b);
  }
  row.appendChild(disp);

  return row;
}

function addThemeForm(ctx: EditCtx): HTMLElement {
  const form = el('div', 'edit-form');
  const title = el('input', 'edit-input');
  title.type = 'text';
  title.placeholder = 'テーマの なまえ';
  title.setAttribute('aria-label', 'テーマの なまえ');
  title.maxLength = 20;
  const prompt = el('input', 'edit-input');
  prompt.type = 'text';
  prompt.placeholder = 'さいしょの しつもん';
  prompt.setAttribute('aria-label', 'さいしょの しつもん');
  prompt.maxLength = 40;
  form.appendChild(title);
  form.appendChild(prompt);

  const actions = el('div', 'edit-form-actions');
  const save = el('button', 'edit-save', 'つくる');
  save.type = 'button';
  save.disabled = true;
  const sync = (): void => {
    save.disabled = title.value.trim() === '' || prompt.value.trim() === '';
  };
  title.addEventListener('input', sync);
  prompt.addEventListener('input', sync);
  save.addEventListener('click', () => {
    if (save.disabled) return;
    ctx.onAddThemeSave(title.value.trim(), prompt.value.trim());
  });
  const cancel = el('button', 'edit-cancel', 'やめる');
  cancel.type = 'button';
  cancel.addEventListener('click', () => ctx.onAddThemeCancel());
  actions.appendChild(save);
  actions.appendChild(cancel);
  form.appendChild(actions);

  setTimeout(() => title.focus(), 0);
  return form;
}

function renderThemeDetail(screen: HTMLElement, ctx: EditCtx): void {
  const theme = ctx.themes.find((t) => t.id === ctx.openThemeId);
  if (!theme) {
    ctx.onBackToList();
    return;
  }

  const head = el('div', 'edit-detail-head');
  const back = el('button', 'edit-mini', '← いちらん');
  back.type = 'button';
  back.addEventListener('click', () => ctx.onBackToList());
  head.appendChild(back);
  head.appendChild(el('span', 'edit-detail-title', theme.title));
  screen.appendChild(head);

  for (const q of theme.questions) {
    screen.appendChild(questionBlock(theme, q, ctx));
  }

  if (theme.builtin) {
    screen.appendChild(restoreRow(theme, ctx));
  }
}

function questionBlock(theme: Theme, q: Question, ctx: EditCtx): HTMLElement {
  const block = el('div', 'edit-question');
  block.appendChild(el('p', 'edit-prompt', q.prompt));

  const toggles = el('div', 'edit-toggles');
  toggles.appendChild(toggleChip(q.enabled ? 'ON' : 'OFF', q.enabled, () => ctx.onToggleEnabled(q.id)));
  toggles.appendChild(toggleChip('よけい', q.escape, () => ctx.onToggleEscape(q.id)));
  toggles.appendChild(toggleChip('シャッフル', q.shuffle, () => ctx.onToggleShuffle(q.id)));
  block.appendChild(toggles);

  const cards = el('div', 'edit-cards');
  for (const card of q.cards) {
    cards.appendChild(cardRow(q, card, ctx));
  }
  block.appendChild(cards);

  if (ctx.addingCardQ === q.id) {
    block.appendChild(addCardForm(q, ctx));
  } else {
    const add = el('button', 'edit-add-card', 'あたらしいカード');
    add.type = 'button';
    add.addEventListener('click', () => ctx.onAddCardStart(q.id));
    block.appendChild(add);
  }

  return block;
}

function cardRow(q: Question, card: Card, ctx: EditCtx): HTMLElement {
  if (ctx.editingCardId === card.id) return editCardForm(q, card, ctx);

  const row = el('div', 'edit-card-row');
  const info = el('div', 'edit-card-info');
  info.appendChild(el('span', 'edit-card-label', card.label));
  if (card.speech) info.appendChild(el('span', 'edit-card-speech', `よみあげ: ${card.speech}`));
  row.appendChild(info);

  const controls = el('div', 'edit-card-controls');
  const edit = el('button', 'edit-mini', 'ことば');
  edit.type = 'button';
  edit.addEventListener('click', () => ctx.onEditCardStart(card.id));
  controls.appendChild(edit);

  const hide = el('button', 'edit-mini', card.hidden === true ? '非表示' : '表示');
  hide.type = 'button';
  if (card.hidden === true) hide.classList.add('off');
  hide.addEventListener('click', () => ctx.onToggleCardHidden(q.id, card.id));
  controls.appendChild(hide);

  controls.appendChild(
    reorderButtons(() => ctx.onMoveCard(q.id, card.id, -1), () => ctx.onMoveCard(q.id, card.id, 1)),
  );
  row.appendChild(controls);
  return row;
}

function editCardForm(q: Question, card: Card, ctx: EditCtx): HTMLElement {
  const form = el('div', 'edit-form');
  const label = el('input', 'edit-input');
  label.type = 'text';
  label.value = card.label;
  label.placeholder = 'ことば';
  label.setAttribute('aria-label', 'ことば');
  label.maxLength = 30;
  const speech = el('input', 'edit-input');
  speech.type = 'text';
  speech.value = card.speech ?? '';
  speech.placeholder = 'よみあげ文（なくてもよい）';
  speech.setAttribute('aria-label', 'よみあげ文');
  speech.maxLength = 60;
  form.appendChild(label);
  form.appendChild(speech);

  form.appendChild(photoControl(q, card, ctx));

  const actions = el('div', 'edit-form-actions');
  const save = el('button', 'edit-save', 'ほぞん');
  save.type = 'button';
  const sync = (): void => {
    save.disabled = label.value.trim() === '';
  };
  label.addEventListener('input', sync);
  save.addEventListener('click', () => {
    if (save.disabled) return;
    ctx.onEditCardSave(q.id, card.id, label.value.trim(), speech.value.trim());
  });
  const cancel = el('button', 'edit-cancel', 'やめる');
  cancel.type = 'button';
  cancel.addEventListener('click', () => ctx.onEditCardCancel());
  actions.appendChild(save);
  actions.appendChild(cancel);
  form.appendChild(actions);

  setTimeout(() => label.focus(), 0);
  return form;
}

// しゃしん: pick a photo (resized + stored locally on the device) for a card, or
// remove the current one. The file input carries `capture=environment` so phones
// offer the camera. Photos never leave the device — no upload (design spec §5).
function photoControl(q: Question, card: Card, ctx: EditCtx): HTMLElement {
  const wrap = el('div', 'edit-photo');

  if (card.photoId) {
    const thumb = el('img', 'edit-photo-thumb');
    thumb.alt = '';
    const pid = card.photoId;
    getPhotoURL(pid)
      .then((url) => {
        if (url && thumb.isConnected) thumb.src = url;
      })
      .catch(() => {});
    wrap.appendChild(thumb);
  }

  const pickLabel = el('label', 'edit-mini', card.photoId ? 'しゃしんを かえる' : 'しゃしんを えらぶ');
  const file = el('input', 'edit-photo-input');
  file.type = 'file';
  file.accept = 'image/*';
  file.setAttribute('capture', 'environment');
  file.setAttribute('aria-label', 'しゃしんを えらぶ');
  file.addEventListener('change', () => {
    const chosen = file.files?.[0];
    if (chosen) void handlePhotoPick(chosen, q.id, card.id, ctx);
  });
  pickLabel.appendChild(file);
  wrap.appendChild(pickLabel);

  if (card.photoId) {
    const pid = card.photoId;
    const remove = el('button', 'edit-mini off', 'しゃしんを けす');
    remove.type = 'button';
    remove.addEventListener('click', () => ctx.onRemoveCardPhoto(q.id, card.id, pid));
    wrap.appendChild(remove);
  }

  wrap.appendChild(el('p', 'edit-photo-note', 'しゃしんは この端末の中だけに保存されます'));
  return wrap;
}

// Resize + store the picked file, then hand the new id to the app. Any failure
// (unsupported file, decode/canvas error) surfaces as a toast — never a silent
// drop, never a broken editor.
async function handlePhotoPick(
  file: File,
  questionId: string,
  cardId: string,
  ctx: EditCtx,
): Promise<void> {
  try {
    const blob = await resizeToBlob(file);
    const photoId = await savePhoto(blob);
    ctx.onSetCardPhoto(questionId, cardId, photoId);
  } catch {
    showToast('しゃしんを よみこめませんでした');
  }
}

function addCardForm(q: Question, ctx: EditCtx): HTMLElement {
  const form = el('div', 'edit-form');
  const label = el('input', 'edit-input');
  label.type = 'text';
  label.placeholder = 'ことば';
  label.setAttribute('aria-label', 'ことば');
  label.maxLength = 30;
  form.appendChild(label);

  // 絵ピッカー: self-contained. Selection lives in the DOM (a local variable +
  // an 'on' class) so typing the label never triggers an app re-render.
  let selected: string | null = null;
  const picker = el('div', 'edit-picker');
  const none = el('button', 'edit-pick edit-pick-none on', 'えなし');
  none.type = 'button';
  const tiles: HTMLButtonElement[] = [none];
  const highlight = (chosen: HTMLButtonElement): void => {
    for (const t of tiles) t.classList.toggle('on', t === chosen);
  };
  none.addEventListener('click', () => {
    selected = null;
    highlight(none);
  });
  picker.appendChild(none);
  for (const id of ART_IDS) {
    const tile = el('button', 'edit-pick');
    tile.type = 'button';
    tile.setAttribute('aria-label', id);
    tile.appendChild(artImg(id));
    tile.addEventListener('click', () => {
      selected = id;
      highlight(tile);
    });
    tiles.push(tile);
    picker.appendChild(tile);
  }
  form.appendChild(picker);

  const actions = el('div', 'edit-form-actions');
  const save = el('button', 'edit-save', 'ついか');
  save.type = 'button';
  save.disabled = true;
  label.addEventListener('input', () => {
    save.disabled = label.value.trim() === '';
  });
  save.addEventListener('click', () => {
    if (save.disabled) return;
    ctx.onAddCardSave(q.id, label.value.trim(), selected);
  });
  const cancel = el('button', 'edit-cancel', 'やめる');
  cancel.type = 'button';
  cancel.addEventListener('click', () => ctx.onAddCardCancel());
  actions.appendChild(save);
  actions.appendChild(cancel);
  form.appendChild(actions);

  setTimeout(() => label.focus(), 0);
  return form;
}

function restoreRow(theme: Theme, ctx: EditCtx): HTMLElement {
  const wrap = el('div', 'edit-restore');
  if (ctx.confirmingRestore) {
    wrap.appendChild(el('span', 'edit-restore-text', 'へんしゅうを 消して もとに もどしますか？'));
    const yes = el('button', 'edit-mini danger', 'もどす');
    yes.type = 'button';
    yes.addEventListener('click', () => ctx.onConfirmRestore(theme.id));
    const no = el('button', 'edit-mini', 'やめる');
    no.type = 'button';
    no.addEventListener('click', () => ctx.onCancelRestore());
    wrap.appendChild(yes);
    wrap.appendChild(no);
  } else {
    const b = el('button', 'edit-mini', 'もとにもどす');
    b.type = 'button';
    b.addEventListener('click', () => ctx.onRequestRestore());
    wrap.appendChild(b);
  }
  return wrap;
}

// Small shared up/down reorder control.
function reorderButtons(onUp: () => void, onDown: () => void): HTMLElement {
  const wrap = el('div', 'edit-reorder');
  const up = el('button', 'edit-arrow', '↑');
  up.type = 'button';
  up.setAttribute('aria-label', 'うえへ');
  up.addEventListener('click', onUp);
  const down = el('button', 'edit-arrow', '↓');
  down.type = 'button';
  down.setAttribute('aria-label', 'したへ');
  down.addEventListener('click', onDown);
  wrap.appendChild(up);
  wrap.appendChild(down);
  return wrap;
}

// A labelled on/off chip. `on` paints the active (green) state.
function toggleChip(label: string, on: boolean, onClick: () => void): HTMLButtonElement {
  const b = el('button', 'edit-chip', label);
  b.type = 'button';
  if (on) b.classList.add('on');
  b.setAttribute('aria-pressed', String(on));
  b.addEventListener('click', onClick);
  return b;
}

// Transient bottom toast; auto-removes. Used to confirm leaving 本人モード.
export function showToast(message: string): void {
  const toast = el('div', 'toast', message);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

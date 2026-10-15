// れいとうこチェッカー — 画面（DOM）。状態をひとつ持ち、変わるたびに描き直す素朴な作り。
import {
  CATEGORIES,
  DEFAULT_BESTBY_DAYS,
  SORT_LABELS,
  UNITS,
  addDays,
  categoryOf,
  filterItems,
  formatDateJa,
  freshness,
  frozenDaysLabel,
  logLine,
  newItem,
  parseBackup,
  restoreItem,
  sortItems,
  summarize,
  takeOut,
  todayStr,
  type SortMode,
} from './logic';
import * as db from './db';
import { blobToDataURL, dataURLToBlob, deletePhoto, getPhotoURL, peekPhotoURL, resizeToBlob, savePhoto } from './photos';
import type { Category, Item, LogEntry, LogType } from './types';

type Tab = 'stock' | 'used' | 'log';
type Screen =
  | { kind: 'list' }
  | { kind: 'form'; mode: 'new' | 'edit'; itemId: string | null; prefill: Partial<Item> | null }
  | { kind: 'detail'; itemId: string };

interface State {
  items: Item[];
  log: LogEntry[];
  tab: Tab;
  screen: Screen;
  category: Category | 'all';
  sort: SortMode;
  query: string;
  /** 入庫フォームで撮った（選んだ）写真。保存するまでここに置く */
  draftPhoto: Blob | null;
  draftPhotoUrl: string | null;
  /** 編集で「写真を消す」を押した */
  draftPhotoRemoved: boolean;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

export function initApp(root: HTMLElement): void {
  const state: State = {
    items: [],
    log: [],
    tab: 'stock',
    screen: { kind: 'list' },
    category: 'all',
    sort: 'soon',
    query: '',
    draftPhoto: null,
    draftPhotoUrl: null,
    draftPhotoRemoved: false,
  };

  let toastTimer = 0;
  const toast = (msg: string) => {
    const el = root.querySelector<HTMLElement>('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => el.classList.remove('show'), 2400);
  };

  const today = () => todayStr();
  const findItem = (id: string | null | undefined) => state.items.find((it) => it.id === id) ?? null;

  async function addLog(type: LogType, item: Item, qty: number): Promise<void> {
    const e: LogEntry = { id: crypto.randomUUID(), type, itemId: item.id, name: item.name, qty, at: Date.now() };
    await db.putLog(e);
    state.log.unshift(e);
  }

  async function reload(): Promise<void> {
    state.items = await db.getAllItems();
    state.log = (await db.getAllLog()).sort((a, b) => b.at - a.at);
    await db.trimLog();
  }

  /** 表示する写真の URL を先に用意してから描く（描画中に await しない） */
  async function warmPhotos(items: Item[]): Promise<void> {
    await Promise.all(items.filter((it) => it.photoId).map((it) => getPhotoURL(it.photoId as string)));
  }

  function clearDraftPhoto(): void {
    if (state.draftPhotoUrl) URL.revokeObjectURL(state.draftPhotoUrl);
    state.draftPhoto = null;
    state.draftPhotoUrl = null;
    state.draftPhotoRemoved = false;
  }

  function setDraftPhoto(blob: Blob): void {
    if (state.draftPhotoUrl) URL.revokeObjectURL(state.draftPhotoUrl);
    state.draftPhoto = blob;
    state.draftPhotoUrl = URL.createObjectURL(blob);
    state.draftPhotoRemoved = false;
  }

  // ── 描画 ───────────────────────────────────────────────────────────────

  function photoHtml(item: Pick<Item, 'photoId' | 'category' | 'name'>, cls: string): string {
    const url = item.photoId ? peekPhotoURL(item.photoId) : null;
    if (url) return `<img class="${cls}" src="${url}" alt="${esc(item.name)} の写真" />`;
    return `<span class="${cls} ${cls}--none" aria-hidden="true">${categoryOf(item.category).emoji}</span>`;
  }

  function headerHtml(): string {
    const s = summarize(state.items, today());
    const parts = [`いま <strong>${s.total}</strong> 品目（${s.pieces}こ）`];
    if (s.soon) parts.push(`<span class="sum-soon">そろそろ ${s.soon}</span>`);
    if (s.over) parts.push(`<span class="sum-over">めやす超え ${s.over}</span>`);
    return `
      <header class="top">
        <h1>❄️ れいとうこチェッカー</h1>
        <p class="summary" role="status">${parts.join('　')}</p>
      </header>`;
  }

  function ctaHtml(): string {
    return `
      <div class="cta">
        <button type="button" class="btn-big" data-action="new-camera">📷 撮って入庫</button>
        <div class="cta__sub">
          <button type="button" class="btn-sub" data-action="new-library">🖼 写真を選んで入庫</button>
          <button type="button" class="btn-sub" data-action="new-plain">✏️ 写真なしで入庫</button>
        </div>
      </div>`;
  }

  function tabsHtml(): string {
    const usedCount = state.items.filter((it) => it.status === 'used').length;
    const t = (id: Tab, label: string) =>
      `<button type="button" class="tab" role="tab" aria-selected="${state.tab === id}" data-action="tab" data-tab="${id}">${label}</button>`;
    return `<nav class="tabs" role="tablist" aria-label="画面えらび">${t('stock', '❄️ 在庫')}${t('used', `✅ 使いきり${usedCount ? `（${usedCount}）` : ''}`)}${t('log', '📒 きろく')}</nav>`;
  }

  function cardHtml(item: Item): string {
    const f = freshness(item, today());
    const cat = categoryOf(item.category);
    return `
      <li class="card card--${f.level}">
        <button type="button" class="card__main" data-action="open" data-id="${item.id}" aria-label="${esc(item.name)} のくわしく">
          ${photoHtml(item, 'card__photo')}
          <span class="card__body">
            <span class="card__name">${esc(item.name)}</span>
            <span class="card__qty">${item.qty} ${esc(item.unit)}<span class="card__cat">・${cat.label}</span></span>
            <span class="card__date">冷凍 ${formatDateJa(item.frozenOn, today())}（${frozenDaysLabel(f.frozenDays)}）</span>
            <span class="badge badge--${f.level}">${f.label}</span>
          </span>
        </button>
        <button type="button" class="card__out" data-action="out" data-id="${item.id}" aria-label="${esc(item.name)} を出庫">出庫</button>
      </li>`;
  }

  function stockHtml(): string {
    const list = sortItems(filterItems(state.items, { category: state.category, query: state.query, status: 'in' }), state.sort);
    const chips = [{ id: 'all', label: 'ぜんぶ', emoji: '' }, ...CATEGORIES]
      .map(
        (c) =>
          `<button type="button" class="chip" aria-pressed="${state.category === c.id}" data-action="cat" data-cat="${c.id}">${c.emoji ? `${c.emoji} ` : ''}${c.label}</button>`,
      )
      .join('');
    const sortOpts = (Object.keys(SORT_LABELS) as SortMode[])
      .map((k) => `<option value="${k}" ${state.sort === k ? 'selected' : ''}>${SORT_LABELS[k]}</option>`)
      .join('');
    const inStock = state.items.some((it) => it.status === 'in');
    let body: string;
    if (!inStock) {
      body = `<p class="empty">冷凍庫は からっぽです。<br />「撮って入庫」から はじめましょう。</p>`;
    } else if (list.length === 0) {
      body = `<p class="empty">この条件に合うものは ありません。</p>`;
    } else {
      body = `<ul class="cards">${list.map(cardHtml).join('')}</ul>`;
    }
    return `
      <div class="filters">
        <input id="q" class="search" type="search" placeholder="さがす（例：とり肉）" value="${esc(state.query)}" aria-label="名前でさがす" autocomplete="off" />
        <div class="chips">${chips}</div>
        <label class="sortrow">並び <select id="sort" aria-label="並び替え">${sortOpts}</select></label>
      </div>
      <div id="list">${body}</div>`;
  }

  function usedHtml(): string {
    const list = state.items
      .filter((it) => it.status === 'used')
      .sort((a, b) => (b.usedOn ?? '').localeCompare(a.usedOn ?? '') || b.updatedAt - a.updatedAt);
    if (list.length === 0) return `<p class="empty">使いきったものは まだありません。<br />在庫の「出庫」で 0 になると ここに並びます。</p>`;
    return `
      <p class="hint">同じものをまた冷凍したら「もういちど入庫」。写真と名前を引きついで、きょうの日付で登録します。</p>
      <ul class="cards">${list
        .map(
          (item) => `
        <li class="card card--used">
          <div class="card__main card__main--static">
            ${photoHtml(item, 'card__photo')}
            <span class="card__body">
              <span class="card__name">${esc(item.name)}</span>
              <span class="card__date">使いきり ${item.usedOn ? formatDateJa(item.usedOn, today()) : ''}（冷凍 ${formatDateJa(item.frozenOn, today())}）</span>
            </span>
          </div>
          <div class="card__actions">
            <button type="button" class="btn-sub btn-sub--accent" data-action="again" data-id="${item.id}">🔁 もういちど入庫</button>
            <button type="button" class="btn-sub" data-action="restore" data-id="${item.id}">在庫にもどす</button>
            <button type="button" class="btn-sub btn-sub--danger" data-action="delete" data-id="${item.id}">消す</button>
          </div>
        </li>`,
        )
        .join('')}</ul>`;
  }

  function logHtml(): string {
    if (state.log.length === 0) return `<p class="empty">まだ きろくは ありません。</p>`;
    return `
      <ul class="log">${state.log.map((e) => `<li class="log__row log__row--${e.type}">${esc(logLine(e))}</li>`).join('')}</ul>
      <div class="toolbar"><button type="button" class="btn-sub" data-action="clear-log">きろくを ぜんぶ消す</button></div>`;
  }

  function detailHtml(item: Item): string {
    const f = freshness(item, today());
    const cat = categoryOf(item.category);
    return `
      <section class="detail">
        <button type="button" class="back" data-action="back">← 一覧にもどる</button>
        ${photoHtml(item, 'detail__photo')}
        <h2 class="detail__name">${esc(item.name)}</h2>
        <dl class="detail__dl">
          <dt>数量</dt><dd><strong class="detail__qty">${item.qty}</strong> ${esc(item.unit)}</dd>
          <dt>しゅるい</dt><dd>${cat.emoji} ${cat.label}</dd>
          <dt>冷凍した日</dt><dd>${formatDateJa(item.frozenOn, today())}（${frozenDaysLabel(f.frozenDays)}）</dd>
          <dt>めやす</dt><dd>${formatDateJa(item.bestBy, today())}　<span class="badge badge--${f.level}">${f.label}</span></dd>
          ${item.memo ? `<dt>メモ</dt><dd>${esc(item.memo)}</dd>` : ''}
        </dl>
        <div class="detail__out">
          <button type="button" class="btn-big btn-big--terra" data-action="out-n" data-id="${item.id}" data-n="1">1つ 出庫</button>
          ${item.qty > 1 ? `<button type="button" class="btn-sub btn-sub--terra" data-action="out-n" data-id="${item.id}" data-n="${item.qty}">ぜんぶ（${item.qty}）出庫</button>` : ''}
        </div>
        <div class="toolbar">
          <button type="button" class="btn-sub" data-action="edit" data-id="${item.id}">✏️ 直す</button>
          <button type="button" class="btn-sub btn-sub--danger" data-action="delete" data-id="${item.id}">🗑 消す</button>
        </div>
      </section>`;
  }

  function formHtml(screen: Extract<Screen, { kind: 'form' }>): string {
    const editing = screen.mode === 'edit' ? findItem(screen.itemId) : null;
    const base: Partial<Item> = editing ?? screen.prefill ?? {};
    const frozenOn = editing ? editing.frozenOn : today();
    const bestBy = editing ? editing.bestBy : addDays(frozenOn, DEFAULT_BESTBY_DAYS);
    const qty = base.qty ?? 1;
    const unit = base.unit ?? UNITS[0];
    const category = base.category ?? 'other';
    const existingUrl = !state.draftPhotoRemoved && !state.draftPhoto && base.photoId ? peekPhotoURL(base.photoId) : null;
    const previewUrl = state.draftPhotoUrl ?? existingUrl;
    const names = [...new Set(state.items.map((it) => it.name))].slice(0, 60);
    const cats = CATEGORIES.map(
      (c) =>
        `<label class="radio"><input type="radio" name="category" value="${c.id}" ${category === c.id ? 'checked' : ''} /><span>${c.emoji} ${c.label}</span></label>`,
    ).join('');
    const units = UNITS.map((u) => `<option value="${u}" ${unit === u ? 'selected' : ''}>${u}</option>`).join('');
    const quick = [
      [14, '2週間'],
      [30, '1か月'],
      [60, '2か月'],
      [90, '3か月'],
    ]
      .map(([n, l]) => `<button type="button" class="chip" data-action="bestby-quick" data-days="${n}">${l}</button>`)
      .join('');
    return `
      <form id="itemForm" class="form" novalidate>
        <button type="button" class="back" data-action="back">← やめて もどる</button>
        <h2 class="form__title">${editing ? '直す' : '冷凍庫に 入れる'}</h2>

        <div class="photo-box" id="photoBox">
          ${previewUrl ? `<img id="photoPreview" class="photo-box__img" src="${previewUrl}" alt="いまの写真" />` : `<div id="photoPreview" class="photo-box__none">写真は まだありません</div>`}
          <div class="photo-box__btns">
            <button type="button" class="btn-sub" data-action="form-camera">📷 ${previewUrl ? '撮りなおす' : '撮る'}</button>
            <button type="button" class="btn-sub" data-action="form-library">🖼 選ぶ</button>
            ${previewUrl ? `<button type="button" class="btn-sub btn-sub--danger" data-action="form-remove-photo">写真を消す</button>` : ''}
          </div>
        </div>

        <label class="field">なまえ
          <input name="name" type="text" maxlength="40" list="nameList" placeholder="例：とり肉、カレー" value="${esc(base.name ?? '')}" autocomplete="off" enterkeyhint="done" />
          <datalist id="nameList">${names.map((n) => `<option value="${esc(n)}"></option>`).join('')}</datalist>
          <span class="field__hint">空のままでも登録できます（しゅるいの名前になります）</span>
        </label>

        <div class="field">数量
          <div class="stepper">
            <button type="button" class="stepper__btn" data-action="qty" data-d="-1" aria-label="1へらす">−</button>
            <input id="qty" name="qty" type="number" inputmode="numeric" min="1" max="999" value="${qty}" />
            <button type="button" class="stepper__btn" data-action="qty" data-d="1" aria-label="1ふやす">＋</button>
            <select name="unit" aria-label="単位">${units}</select>
          </div>
        </div>

        <fieldset class="field"><legend>しゅるい</legend><div class="radios">${cats}</div></fieldset>

        <div class="field two">
          <label>冷凍した日 <input id="frozenOn" name="frozenOn" type="date" value="${frozenOn}" required /></label>
          <label>めやす <input id="bestBy" name="bestBy" type="date" value="${bestBy}" required /></label>
        </div>
        <div class="chips chips--left" aria-label="めやすを冷凍した日から数えて">${quick}</div>

        <label class="field">メモ
          <input name="memo" type="text" maxlength="60" placeholder="例：下味つき、半分は使った" value="${esc(base.memo ?? '')}" autocomplete="off" />
        </label>

        <button type="submit" class="btn-big">${editing ? '保存する' : '❄️ 冷凍庫に 入れた！'}</button>
      </form>`;
  }

  function mainHtml(): string {
    const sc = state.screen;
    if (sc.kind === 'form') return formHtml(sc);
    if (sc.kind === 'detail') {
      const item = findItem(sc.itemId);
      if (item) return detailHtml(item);
      state.screen = { kind: 'list' };
    }
    if (state.tab === 'used') return usedHtml();
    if (state.tab === 'log') return logHtml();
    return stockHtml();
  }

  function render(): void {
    const isList = state.screen.kind === 'list';
    root.innerHTML = `
      ${headerHtml()}
      ${isList ? ctaHtml() : ''}
      ${isList ? tabsHtml() : ''}
      <main id="main">${mainHtml()}</main>
      <details class="backup">
        <summary>📦 バックアップ（機種変更のときなどに）</summary>
        <p>写真ごと 1 つのファイルに書き出します。読み込むと、いまの中身は置きかわります。</p>
        <div class="toolbar">
          <button type="button" class="btn-sub" data-action="export">書き出す</button>
          <button type="button" class="btn-sub" data-action="import">読み込む</button>
        </div>
      </details>
      <footer>
        写真も記録も<strong>この端末の中だけ</strong>に保存され、どこにも送られません。「ホーム画面に追加」しておくと、データが消えにくく、アイコンからすぐ開けます。<br />
        めやすは冷凍した日から ${DEFAULT_BESTBY_DAYS} 日を初期値にしています（食品や保存状態で変わります。実際の判断はご自身で）。<br />
        つくったのは <a href="https://www.nponest.com/ai-tips/">NPO法人nest「教えてAIさん」</a> のAIチームです。
      </footer>
      <input id="pickCamera" type="file" accept="image/*" capture="environment" hidden />
      <input id="pickLibrary" type="file" accept="image/*" hidden />
      <input id="pickBackup" type="file" accept="application/json,.json" hidden />
      <dialog id="dlg" class="dlg"></dialog>
      <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
    if (state.screen.kind === 'form') {
      root.querySelector<HTMLFormElement>('#itemForm')?.addEventListener('submit', onSubmit);
      if (state.screen.mode === 'new' && !state.draftPhoto) root.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }
  }

  async function refresh(): Promise<void> {
    await warmPhotos(state.items);
    render();
  }

  // ── 操作 ───────────────────────────────────────────────────────────────

  /** 写真を撮る／選ぶ入口。次に写真が来たときに何をするかを覚えておく */
  let photoThen: 'open-form' | 'update-form' = 'open-form';
  function pick(source: 'camera' | 'library', then: typeof photoThen): void {
    photoThen = then;
    const input = root.querySelector<HTMLInputElement>(source === 'camera' ? '#pickCamera' : '#pickLibrary');
    if (!input) return;
    input.value = '';
    input.click();
  }

  async function onPhotoPicked(file: File): Promise<void> {
    try {
      const blob = await resizeToBlob(file);
      setDraftPhoto(blob);
    } catch {
      toast('この写真は読み込めませんでした');
      return;
    }
    if (photoThen === 'open-form' || state.screen.kind !== 'form') {
      state.screen = { kind: 'form', mode: 'new', itemId: null, prefill: null };
      render();
    } else {
      // フォームの入力を消さないよう、プレビューだけ差し替える
      const box = root.querySelector<HTMLElement>('#photoBox');
      if (box && state.draftPhotoUrl) {
        box.innerHTML = `
          <img id="photoPreview" class="photo-box__img" src="${state.draftPhotoUrl}" alt="いまの写真" />
          <div class="photo-box__btns">
            <button type="button" class="btn-sub" data-action="form-camera">📷 撮りなおす</button>
            <button type="button" class="btn-sub" data-action="form-library">🖼 選ぶ</button>
            <button type="button" class="btn-sub btn-sub--danger" data-action="form-remove-photo">写真を消す</button>
          </div>`;
      }
    }
  }

  async function onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const fd = new FormData(form);
    const sc = state.screen;
    if (sc.kind !== 'form') return;
    const now = Date.now();
    const values = {
      name: String(fd.get('name') ?? ''),
      qty: Number(fd.get('qty') ?? 1),
      unit: String(fd.get('unit') ?? UNITS[0]),
      category: String(fd.get('category') ?? 'other') as Category,
      frozenOn: String(fd.get('frozenOn') ?? today()),
      bestBy: String(fd.get('bestBy') ?? ''),
      memo: String(fd.get('memo') ?? ''),
    };
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) submit.disabled = true;
    try {
      if (sc.mode === 'edit' && sc.itemId) {
        const cur = findItem(sc.itemId);
        if (!cur) return;
        let photoId = cur.photoId;
        if (state.draftPhoto) {
          if (photoId) await deletePhoto(photoId);
          photoId = await savePhoto(state.draftPhoto);
        } else if (state.draftPhotoRemoved && photoId) {
          await deletePhoto(photoId);
          photoId = null;
        }
        const draft = newItem({ id: cur.id, ...values, photoId }, now);
        const updated: Item = { ...cur, ...draft, status: cur.status, usedOn: cur.usedOn, createdAt: cur.createdAt, updatedAt: now };
        await db.putItem(updated);
        state.items = state.items.map((it) => (it.id === updated.id ? updated : it));
        clearDraftPhoto();
        state.screen = { kind: 'detail', itemId: updated.id };
        await refresh();
        toast('直しました');
      } else {
        let photoId: string | null = null;
        if (state.draftPhoto) photoId = await savePhoto(state.draftPhoto);
        const item = newItem({ id: crypto.randomUUID(), ...values, photoId }, now);
        await db.putItem(item);
        state.items.push(item);
        await addLog('in', item, item.qty);
        clearDraftPhoto();
        state.screen = { kind: 'list' };
        state.tab = 'stock';
        await refresh();
        toast(`❄️ ${item.name} を入れました`);
        if (navigator.vibrate) navigator.vibrate(60);
      }
    } catch {
      toast('保存できませんでした。もう一度お試しください');
      if (submit) submit.disabled = false;
    }
  }

  async function doOut(item: Item, n: number): Promise<void> {
    const updated = takeOut(item, n, today(), Date.now());
    await db.putItem(updated);
    state.items = state.items.map((it) => (it.id === updated.id ? updated : it));
    await addLog('out', item, Math.min(n, item.qty));
    if (state.screen.kind === 'detail' && updated.status === 'used') state.screen = { kind: 'list' };
    await refresh();
    toast(updated.status === 'used' ? `✅ ${item.name} を使いきりました` : `${item.name}　のこり ${updated.qty} ${updated.unit}`);
    if (navigator.vibrate) navigator.vibrate(40);
  }

  function askOut(item: Item): void {
    if (item.qty <= 1) { void doOut(item, 1); return; }
    const dlg = root.querySelector<HTMLDialogElement>('#dlg');
    if (!dlg || typeof dlg.showModal !== 'function') { void doOut(item, 1); return; }
    dlg.innerHTML = `
      <p class="dlg__title">${esc(item.name)}<br /><span class="dlg__sub">いま ${item.qty} ${esc(item.unit)}</span></p>
      <button type="button" class="btn-big btn-big--terra" data-action="dlg-out" data-id="${item.id}" data-n="1">1つ 出す</button>
      <button type="button" class="btn-sub btn-sub--terra" data-action="dlg-out" data-id="${item.id}" data-n="${item.qty}">ぜんぶ（${item.qty}）出す</button>
      <button type="button" class="btn-sub" data-action="dlg-close">やめる</button>`;
    dlg.showModal();
  }

  async function deleteItemFully(item: Item): Promise<void> {
    if (!window.confirm(`「${item.name}」を消します。よろしいですか？`)) return;
    if (item.photoId) await deletePhoto(item.photoId);
    await db.deleteItem(item.id);
    state.items = state.items.filter((it) => it.id !== item.id);
    await addLog('delete', item, item.qty);
    if (state.screen.kind !== 'list') state.screen = { kind: 'list' };
    await refresh();
    toast('消しました');
  }

  async function again(item: Item): Promise<void> {
    clearDraftPhoto();
    if (item.photoId) {
      const blob = await db.getPhoto(item.photoId);
      if (blob) setDraftPhoto(blob);
    }
    state.screen = { kind: 'form', mode: 'new', itemId: null, prefill: { name: item.name, unit: item.unit, category: item.category, memo: item.memo, qty: 1 } };
    render();
  }

  async function exportBackup(): Promise<void> {
    const photos: Record<string, string> = {};
    for (const it of state.items) {
      if (!it.photoId) continue;
      const blob = await db.getPhoto(it.photoId);
      if (blob) photos[it.photoId] = await blobToDataURL(blob);
    }
    const data = { app: 'reitouko', version: 1, exportedAt: Date.now(), items: state.items, log: state.log, photos };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reitouko-backup-${today()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    toast('書き出しました');
  }

  async function importBackup(file: File): Promise<void> {
    let parsed;
    try {
      parsed = parseBackup(JSON.parse(await file.text()));
    } catch {
      parsed = null;
    }
    if (!parsed) { toast('このファイルは読み込めません'); return; }
    if (!window.confirm(`${parsed.items.length} 品目を読み込み、いまの中身と置きかえます。よろしいですか？`)) return;
    await db.clearAll();
    for (const it of parsed.items) await db.putItem(it);
    for (const e of parsed.log) await db.putLog(e);
    for (const [id, dataUrl] of Object.entries(parsed.photos)) {
      try { await db.putPhoto(id, await dataURLToBlob(dataUrl)); } catch { /* 壊れた写真は飛ばす */ }
    }
    await reload();
    state.screen = { kind: 'list' };
    state.tab = 'stock';
    await refresh();
    toast('読み込みました');
  }

  // ── イベント（委譲） ───────────────────────────────────────────────────

  root.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    const item = findItem(btn.dataset.id);
    switch (action) {
      case 'new-camera': clearDraftPhoto(); pick('camera', 'open-form'); break;
      case 'new-library': clearDraftPhoto(); pick('library', 'open-form'); break;
      case 'new-plain': clearDraftPhoto(); state.screen = { kind: 'form', mode: 'new', itemId: null, prefill: null }; render(); break;
      case 'form-camera': pick('camera', 'update-form'); break;
      case 'form-library': pick('library', 'update-form'); break;
      case 'form-remove-photo': {
        if (state.draftPhotoUrl) URL.revokeObjectURL(state.draftPhotoUrl);
        state.draftPhoto = null; state.draftPhotoUrl = null; state.draftPhotoRemoved = true;
        const box = root.querySelector<HTMLElement>('#photoBox');
        if (box) box.innerHTML = `
          <div id="photoPreview" class="photo-box__none">写真は まだありません</div>
          <div class="photo-box__btns">
            <button type="button" class="btn-sub" data-action="form-camera">📷 撮る</button>
            <button type="button" class="btn-sub" data-action="form-library">🖼 選ぶ</button>
          </div>`;
        break;
      }
      case 'tab': state.tab = btn.dataset.tab as Tab; render(); break;
      case 'cat': state.category = btn.dataset.cat as Category | 'all'; render(); break;
      case 'open': if (item) { state.screen = { kind: 'detail', itemId: item.id }; render(); } break;
      case 'back': clearDraftPhoto(); state.screen = state.screen.kind === 'form' && state.screen.mode === 'edit' && state.screen.itemId ? { kind: 'detail', itemId: state.screen.itemId } : { kind: 'list' }; render(); break;
      case 'out': if (item) askOut(item); break;
      case 'out-n': if (item) void doOut(item, Number(btn.dataset.n) || 1); break;
      case 'dlg-out': root.querySelector<HTMLDialogElement>('#dlg')?.close(); if (item) void doOut(item, Number(btn.dataset.n) || 1); break;
      case 'dlg-close': root.querySelector<HTMLDialogElement>('#dlg')?.close(); break;
      case 'edit': if (item) { clearDraftPhoto(); state.screen = { kind: 'form', mode: 'edit', itemId: item.id, prefill: null }; render(); } break;
      case 'delete': if (item) void deleteItemFully(item); break;
      case 'restore': if (item) {
        const updated = restoreItem(item, Date.now());
        void (async () => { await db.putItem(updated); state.items = state.items.map((it) => (it.id === updated.id ? updated : it)); await addLog('restore', updated, updated.qty); await refresh(); toast(`${updated.name} を在庫にもどしました`); })();
      } break;
      case 'again': if (item) void again(item); break;
      case 'clear-log': if (window.confirm('きろくを ぜんぶ消します。在庫は消えません。よろしいですか？')) { void (async () => { for (const l of state.log) await db.deleteLog(l.id); state.log = []; render(); })(); } break;
      case 'qty': {
        const input = root.querySelector<HTMLInputElement>('#qty');
        if (input) input.value = String(Math.min(999, Math.max(1, (Number(input.value) || 1) + Number(btn.dataset.d))));
        break;
      }
      case 'bestby-quick': {
        const f = root.querySelector<HTMLInputElement>('#frozenOn');
        const b = root.querySelector<HTMLInputElement>('#bestBy');
        if (f && b) b.value = addDays(f.value || today(), Number(btn.dataset.days));
        break;
      }
      case 'export': void exportBackup(); break;
      case 'import': { const i = root.querySelector<HTMLInputElement>('#pickBackup'); if (i) { i.value = ''; i.click(); } break; }
    }
  });

  root.addEventListener('change', (e) => {
    const t = e.target as HTMLInputElement | HTMLSelectElement;
    if (t.id === 'pickCamera' || t.id === 'pickLibrary') {
      const file = (t as HTMLInputElement).files?.[0];
      if (file) void onPhotoPicked(file);
    } else if (t.id === 'pickBackup') {
      const file = (t as HTMLInputElement).files?.[0];
      if (file) void importBackup(file);
    } else if (t.id === 'sort') {
      state.sort = t.value as SortMode;
      render();
    } else if (t.id === 'frozenOn') {
      // 冷凍した日を変えたら、めやすも同じ日数ぶんずらす
      const b = root.querySelector<HTMLInputElement>('#bestBy');
      if (b && t.value) b.value = addDays(t.value, DEFAULT_BESTBY_DAYS);
    }
  });

  root.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === 'q') {
      state.query = t.value;
      const list = root.querySelector<HTMLElement>('#list');
      if (!list) return;
      // 入力欄のフォーカスを保つため、一覧だけ描き直す
      const tmp = document.createElement('div');
      tmp.innerHTML = stockHtml();
      list.innerHTML = tmp.querySelector('#list')?.innerHTML ?? '';
    }
  });

  // ── 起動 ───────────────────────────────────────────────────────────────
  void (async () => {
    try { await navigator.storage?.persist?.(); } catch { /* 対応していない端末 */ }
    try {
      await reload();
    } catch {
      root.innerHTML = `<p class="empty">この端末のブラウザでは保存領域が使えません。<br />プライベートブラウズを解除するか、別のブラウザでお試しください。</p>`;
      return;
    }
    await refresh();
  })();
}

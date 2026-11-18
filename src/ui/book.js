/** Экран-книга: глава 1 постранично, с выбором реплики и письмом. */

import { CHAPTER1 } from '../../data/chapter1.js';
import { addChronicleEntry, store } from '../core/state.js';
import { el } from './dom.js';
import { lockTime, unlockTime } from './overlay.js';
import { openTab } from './panels.js';

let pageIndex = 0;
let reply = null;
let isOpen = false;

function overlay() {
  return document.querySelector('[data-overlay="book"]');
}

function renderCover(body, page) {
  body.append(el('p', 'book-note', page.note));
  body.append(el('h2', 'book-title', page.title));
  body.append(el('p', 'book-epigraph', page.epigraph));
}

function renderParagraphs(body, paragraphs) {
  const wrap = el('div', 'book-text');
  for (const paragraph of paragraphs) wrap.append(el('p', '', paragraph));
  body.append(wrap);
}

function renderText(body, page) {
  renderParagraphs(body, page.paragraphs);

  if (page.glitch) {
    const block = el('div', 'glitch');
    for (const line of page.glitch) block.append(el('div', '', line));
    body.append(block);
  }

  if (page.afterGlitch) {
    body.append(el('p', 'book-after', page.afterGlitch));
  }
}

function choose(choice) {
  reply = choice.id;

  store.update((state) => {
    state.flags.chapter1_reply = choice.id;
    if (choice.trust) state.player.trust += choice.trust;
  });

  render();
}

function renderChoice(body, page) {
  renderParagraphs(body, page.paragraphs);

  if (!reply) {
    body.append(el('p', 'choice-prompt', page.prompt));

    const group = el('div', 'book-choice');
    for (const choice of page.choices) {
      const button = el('button', 'choice-btn', choice.label);
      button.type = 'button';
      button.addEventListener('click', () => choose(choice));
      group.append(button);
    }

    body.append(group);
    return;
  }

  const chosen = page.choices.find((choice) => choice.id === reply);
  if (!chosen) return;

  body.append(el('blockquote', 'chosen-reply', chosen.label));
  body.append(el('p', 'book-response', chosen.response));
}

function renderLetter(body, page) {
  renderParagraphs(body, page.paragraphs);

  const { letter } = page;
  const card = el('div', 'book-letter');

  const head = el('div', 'letter-head');
  head.append(el('span', '', 'От:'), el('span', '', letter.from));
  head.append(el('span', '', 'Кому:'), el('span', '', letter.to));
  card.append(head);

  card.append(el('p', 'letter-subject', letter.subject));

  for (const line of letter.lines) {
    card.append(el('p', 'letter-line', line));
  }

  body.append(card);
}

function renderFooter(page) {
  const isLast = pageIndex === CHAPTER1.pages.length - 1;

  const kicker = document.querySelector('[data-book-kicker]');
  const progress = document.querySelector('[data-book-progress]');
  const prev = document.querySelector('[data-book-prev]');
  const next = document.querySelector('[data-book-next]');

  kicker.textContent = `Глава ${CHAPTER1.roman} · ${CHAPTER1.title}`;
  progress.textContent = `${pageIndex + 1} / ${CHAPTER1.pages.length}`;

  prev.disabled = pageIndex === 0;
  next.disabled = page.kind === 'choice' && !reply;

  if (page.kind === 'cover') next.textContent = 'Открыть';
  else if (isLast) next.textContent = 'Выйти во двор';
  else next.textContent = 'Далее';
}

function render() {
  const page = CHAPTER1.pages[pageIndex];
  const body = document.querySelector('[data-book-body]');

  body.replaceChildren();

  if (page.kind === 'cover') renderCover(body, page);
  else if (page.kind === 'choice') renderChoice(body, page);
  else if (page.kind === 'letter') renderLetter(body, page);
  else renderText(body, page);

  body.scrollTop = 0;
  renderFooter(page);
}

function goNext() {
  const page = CHAPTER1.pages[pageIndex];

  if (page.kind === 'choice' && !reply) return;

  if (pageIndex === CHAPTER1.pages.length - 1) {
    closeBook({ finished: true });
    return;
  }

  pageIndex += 1;
  render();
}

function closeBook({ finished = false } = {}) {
  if (!isOpen) return;

  isOpen = false;
  overlay().hidden = true;
  document.body.classList.remove('is-modal');
  unlockTime();

  if (!store.state.flags.chapter1_intro_done) {
    store.update((state) => {
      state.flags.chapter1_intro_done = true;
    });
  }

  if (finished && !store.state.flags.chapter1_chronicle) {
    store.update((state) => {
      state.flags.chapter1_chronicle = true;
    });

    addChronicleEntry(
      'Глава I. Пробуждение',
      'Зар просыпается в чужом теле, слышит слово «симуляция» и выходит во двор. ' +
        'Деревня умирает — но теперь у неё есть он.',
    );

    openTab('village');
  }
}

export function openBook() {
  if (isOpen) {
    // Если книгу открыли заново после сброса, состояние могло потерять паузу.
    store.update((state) => {
      state.time.uiPaused = true;
    });
    return;
  }

  isOpen = true;
  pageIndex = 0;
  reply = store.state.flags.chapter1_reply ?? null;

  const root = overlay();
  root.hidden = false;
  document.body.classList.add('is-modal');
  lockTime();
  render();
}

export function initBook() {
  const root = overlay();

  root.querySelector('[data-book-close]').addEventListener('click', () => closeBook());
  root.querySelector('[data-book-prev]').addEventListener('click', () => {
    if (pageIndex === 0) return;
    pageIndex -= 1;
    render();
  });
  root.querySelector('[data-book-next]').addEventListener('click', goNext);

  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;

    if (event.key === 'Escape') closeBook();
    if (event.key === 'ArrowRight') goNext();
    if (event.key === 'ArrowLeft' && pageIndex > 0) {
      pageIndex -= 1;
      render();
    }
  });
}

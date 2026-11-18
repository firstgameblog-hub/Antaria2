/** Диалог с травницей: ветка выбора и запись шага квеста. */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { checkChapterQuest } from '../systems/quests.js';
import { el } from './dom.js';
import { lockTime, unlockTime } from './overlay.js';

const HERBALIST = {
  speaker: 'Мирна',
  role: 'травница',
  intro: [
    '— Зашёл всё-таки. Садись, коли пришёл.',
    'Она не отрывается от пучка трав, но голос не злой — усталый.',
  ],
  prompt: 'О чём спросить?',
  choices: [
    {
      id: 'herbs',
      label: '«Что растёт у опушки?»',
      response:
        '— Травы. Пучки у самой кромки, ягоды на старом кусте, сухостой после ветровала. ' +
        'Две горсти трав на костёр — и будет отвар. Только не вытопчи всё разом: трава не железо, за ночь не нарастёт.',
    },
    {
      id: 'potion',
      label: '«Мне нужен отвар.»',
      response:
        '— Нужен — так свари. Две горсти трав, костёр, полчаса терпения. ' +
        'Держи один, пусть будет. В это лето без отвара далеко не уйдёшь.',
      gift: { potion: 1 },
      giftText: 'Мирна дала тебе отвар.',
    },
    {
      id: 'village',
      label: '«Почему деревня умирает?»',
      response:
        '— Не урожай её убил и не бандиты. Люди уходят. Сначала по одному, потом семьями. ' +
        'Остались те, кому идти некуда. Ты, Зар, — тоже остался. Хоть на тебя одна надежда.',
    },
  ],
};

let isOpen = false;
let answered = null;

function overlay() {
  return document.querySelector('[data-overlay="dialogue"]');
}

function bodyNode() {
  return document.querySelector('[data-dialogue-body]');
}

function footNode() {
  return document.querySelector('[data-dialogue-foot]');
}

function renderIntro() {
  const body = bodyNode();
  body.replaceChildren();

  for (const line of HERBALIST.intro) body.append(el('p', '', line));
  body.append(el('p', 'choice-prompt', HERBALIST.prompt));

  const foot = footNode();
  foot.replaceChildren();

  for (const choice of HERBALIST.choices) {
    const button = el('button', 'choice-btn', choice.label);
    button.type = 'button';
    button.addEventListener('click', () => pick(choice));
    foot.append(button);
  }
}

function pick(choice) {
  answered = choice;

  if (choice.gift && !store.state.flags.herbalist_gift) {
    store.update((state) => {
      state.flags.herbalist_gift = true;
      for (const [id, quantity] of Object.entries(choice.gift)) {
        state.resources[id] = (state.resources[id] ?? 0) + quantity;
      }
    });

    if (choice.giftText) bus.emit('ui:toast', choice.giftText);
  }

  renderResponse();
}

function renderResponse() {
  const body = bodyNode();
  body.replaceChildren();

  if (!answered) return;

  body.append(el('blockquote', 'chosen-reply', answered.label));
  body.append(el('p', 'book-response', answered.response));

  const foot = footNode();
  foot.replaceChildren();

  const button = el('button', 'btn', 'Закончить разговор');
  button.type = 'button';
  button.addEventListener('click', finish);
  foot.append(button);
}

function finish() {
  if (!isOpen) return;

  const firstTalk = !store.state.flags.met_herbalist;

  if (firstTalk) {
    store.update((state) => {
      state.flags.met_herbalist = true;
    });
  }

  close();
  checkChapterQuest();

  if (firstTalk) {
    bus.emit('ui:toast', 'Мирна запомнит этот разговор.');
  }
}

function close() {
  isOpen = false;
  overlay().hidden = true;
  document.body.classList.remove('is-modal');
  unlockTime();
}

export function openHerbalist() {
  if (isOpen) return;

  isOpen = true;
  answered = null;

  document.querySelector('[data-dialogue-speaker]').textContent = HERBALIST.speaker;
  document.querySelector('[data-dialogue-role]').textContent = HERBALIST.role;

  const root = overlay();
  root.hidden = false;
  document.body.classList.add('is-modal');
  lockTime();
  renderIntro();
}

export function initDialogue() {
  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') finish();
  });
}

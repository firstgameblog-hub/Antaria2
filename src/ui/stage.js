/** Карточка следующей стадии и сцена перехода. */

import { bus } from '../core/events.js';
import { advanceStage, canAdvanceStage, getNextStage, getStageGoals } from '../systems/stages.js';
import { el } from './dom.js';
import { lockTime, unlockTime } from './overlay.js';
import { toast } from './toast.js';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

let transitioning = false;
let timers = [];

function progressText(goal) {
  if (goal.type === 'building') {
    return `${Math.round(goal.progress * 100)}% из ${Math.round(goal.amount * 100)}%`;
  }

  return `${Math.floor(goal.progress)} из ${goal.amount}`;
}

function renderCard() {
  const host = document.querySelector('[data-stage-card]');
  if (!host) return;

  const next = getNextStage();

  if (!next) {
    const card = el('section', 'quest-card stage-card');
    card.append(el('h2', 'panel-title', 'Вечный город'));
    card.append(el('p', 'muted', 'Последняя стадия. Осталось решить судьбу города.'));
    host.replaceChildren(card);
    return;
  }

  const goals = getStageGoals();
  const ready = canAdvanceStage();

  const card = el('section', `quest-card stage-card${ready ? ' is-ready' : ''}`);

  const head = el('div', 'quest-head');
  head.append(el('h2', 'panel-title', 'Следующая стадия'));
  if (ready) head.append(el('span', 'quest-badge', 'готова'));
  card.append(head);

  card.append(el('p', 'stage-next', `${next.id}. ${next.name}`));
  card.append(el('p', 'muted', `Глава «${next.chapter}»`));

  if (!goals.length) {
    card.append(
      el('p', 'muted', 'Требования этой стадии появятся вместе с её контентом.'),
    );
    host.replaceChildren(card);
    return;
  }

  const list = el('ol', 'quest-steps');

  for (const goal of goals) {
    const item = el('li', `quest-step${goal.done ? ' is-done' : ''}`);
    item.append(el('span', 'quest-mark', goal.done ? '✓' : '○'));
    item.append(el('span', 'quest-text', goal.label));
    item.append(el('span', 'quest-progress', progressText(goal)));
    list.append(item);
  }

  card.append(list);

  const button = el(
    'button',
    'btn stage-button',
    ready ? 'Перейти' : 'Требования не выполнены',
  );
  button.type = 'button';
  button.disabled = !ready;
  button.addEventListener('click', () => startTransition(next));
  card.append(button);

  host.replaceChildren(card);
}

function startTransition(next) {
  if (transitioning || !canAdvanceStage()) return;

  const root = document.querySelector('[data-overlay="stage"]');
  if (!root) return;

  transitioning = true;

  const kicker = root.querySelector('[data-stage-kicker]');
  const title = root.querySelector('[data-stage-title]');
  const text = root.querySelector('[data-stage-text]');

  kicker.textContent = `Глава ${ROMAN[next.id] ?? next.id} · ${next.chapter}`;
  title.textContent = next.name;
  text.textContent = 'Деревня переходит на новую стадию. Старое остаётся за воротами.';

  root.hidden = false;
  root.classList.remove('is-morning');
  document.body.classList.add('is-modal');
  lockTime();

  void root.offsetWidth;
  root.classList.add('is-active');

  timers.push(
    window.setTimeout(() => {
      advanceStage();

      root.classList.add('is-morning');
      kicker.textContent = `Стадия ${next.id}`;
      title.textContent = next.name;
      text.textContent = 'Новая глава началась. За воротами уже другой мир.';
    }, 3400),
  );

  timers.push(
    window.setTimeout(() => {
      root.classList.remove('is-active');
    }, 6300),
  );

  timers.push(
    window.setTimeout(() => {
      root.hidden = true;
      document.body.classList.remove('is-modal');

      unlockTime();

      transitioning = false;
      timers = [];

      toast(`Новая стадия: ${next.name}.`);
    }, 7000),
  );
}

export function initStage() {
  bus.on('state:changed', renderCard);
  bus.on('stage:changed', renderCard);

  renderCard();
}

/** Экран стройки: доступные постройки, эффекты деревни, очередь работ. */

import { BUILDINGS } from '../../data/buildings.js';
import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { absoluteMinutes, formatDuration } from '../core/time.js';
import {
  build,
  formatEffects,
  getBuildView,
  getVillageEffects,
  maxWorkers,
  workersBusy,
} from '../systems/buildings.js';
import { el } from './dom.js';

const CATEGORY_NAMES = {
  housing: 'жильё',
  craft: 'ремесло',
  defense: 'оборона',
  food: 'еда',
  storage: 'склад',
  civic: 'управление',
  trade: 'торговля',
  special: 'особое',
};

function visibleDefinitions() {
  return Object.values(BUILDINGS).filter(
    (def) =>
      def.buildable !== false &&
      def.stageFrom <= store.state.stage + 1,
  );
}

function costChips(cost = {}) {
  const wrap = el('div', 'ingredients');

  for (const [id, need] of Object.entries(cost)) {
    const have = store.state.resources[id] ?? 0;
    wrap.append(
      el(
        'span',
        `ingredient${have < need ? ' is-missing' : ''}`,
        `${RESOURCES[id].name} ${have}/${need}`,
      ),
    );
  }

  return wrap;
}

function renderCard(def) {
  const view = getBuildView(def);
  const { record, next, job, check } = view;

  const locked = def.stageFrom > store.state.stage;
  const card = el('article', `recipe-card build-card${locked ? ' is-locked' : ''}`);

  const head = el('div', 'recipe-head');
  head.append(el('h3', 'recipe-name', def.name));

  const status =
    def.unique
      ? record.level > 0
        ? `ур. ${record.level}`
        : 'не построено'
      : `${record.count} шт.`;

  head.append(
    el('span', 'recipe-station', `${CATEGORY_NAMES[def.category] ?? def.category} · ${status}`),
  );
  card.append(head);

  card.append(el('p', 'recipe-lore', def.lore));

  if (record.level > 0) {
    const currentDef = def.levels[record.level - 1];
    const multiplier = def.unique ? 1 : Math.max(1, record.count);
    const effects = formatEffects(currentDef.effects) || '—';
    card.append(
      el(
        'p',
        'build-effects',
        `Сейчас: ${effects}${multiplier > 1 ? ` × ${multiplier}` : ''}`,
      ),
    );
  }

  if (locked) {
    card.append(el('p', 'build-next', `Откроется на стадии ${def.stageFrom}.`));
  } else if (job) {
    const remaining = Math.max(0, job.endsAt - absoluteMinutes(store.state));
    card.append(el('p', 'build-next', `Строится: осталось ${formatDuration(remaining)}`));
  } else if (next) {
    card.append(
      el(
        'p',
        'build-next',
        def.unique
          ? `Далее: ${next.name} — ${formatEffects(next.effects) || 'без эффектов'}`
          : `Построить ещё: ${formatEffects(next.effects) || 'без эффектов'}`,
      ),
    );
  } else if (def.unique && record.level > 0) {
    card.append(el('p', 'build-next', 'Максимальный уровень.'));
  }

  if (next) card.append(costChips(next.cost));

  const foot = el('div', 'recipe-foot');
  foot.append(
    el(
      'span',
      'recipe-time',
      next ? `${formatDuration(next.minutes)} · 1 рабочий` : '',
    ),
  );

  const button = el('button', 'btn');
  button.type = 'button';

  if (locked) {
    button.textContent = `Стадия ${def.stageFrom}`;
    button.disabled = true;
  } else if (job) {
    button.textContent = 'Строится…';
    button.disabled = true;
  } else if (!next) {
    button.textContent = 'Максимум';
    button.disabled = true;
  } else if (!check.ok) {
    button.textContent = check.reason.startsWith('Не хватает')
      ? 'Не хватает'
      : check.reason.startsWith('Нет свободных')
        ? 'Нет рабочих'
        : 'Недоступно';
    button.disabled = true;
    button.title = check.reason;
  } else {
    button.textContent = 'Строить';
    button.addEventListener('click', () => build(def.id));
  }

  foot.append(button);
  card.append(foot);

  return card;
}

function renderCards() {
  const host = document.querySelector('[data-buildings]');
  host.replaceChildren(...visibleDefinitions().map(renderCard));
}

function renderEffects() {
  const host = document.querySelector('[data-village-effects]');
  const effects = getVillageEffects();
  const state = store.state;

  const rows = [
    ['Жильё', `${effects.housing} (${state.population} занято)`],
    ['Склад', effects.storage > 0 ? String(effects.storage) : 'нет'],
    ['Защита', String(effects.defense)],
    ['Уют', String(effects.comfort)],
    ['Еда', String(effects.food)],
  ];

  host.replaceChildren(
    ...rows.map(([label, value]) => {
      const block = el('div', 'stat');
      block.append(el('dt', '', label));
      block.append(el('dd', '', value));
      return block;
    }),
  );

  document.querySelector('[data-build-workers]').textContent =
    `${workersBusy()} / ${maxWorkers()}`;
}

function renderQueue() {
  const host = document.querySelector('[data-build-queue]');
  const jobs = store.state.construction;

  if (!jobs.length) {
    host.replaceChildren(el('li', 'muted', 'Пока ничего не строится.'));
    return;
  }

  host.replaceChildren(
    ...jobs.map((job) => {
      const def = BUILDINGS[job.buildingId];
      const name = def?.levels[job.level - 1]?.name ?? def?.name ?? 'Неизвестно';

      const item = el('li');
      item.append(el('span', 'queue-name', name));

      const eta = el('span', 'queue-eta');
      eta.dataset.buildEta = String(job.endsAt);
      eta.textContent = formatDuration(job.endsAt - absoluteMinutes(store.state));
      item.append(eta);

      return item;
    }),
  );
}

function updateCountdowns() {
  const now = absoluteMinutes(store.state);

  for (const node of document.querySelectorAll('[data-build-eta]')) {
    const remaining = Number(node.dataset.buildEta) - now;
    const text = remaining > 0 ? formatDuration(remaining) : 'вот-вот';

    if (node.textContent !== text) node.textContent = text;
  }
}

function render() {
  renderCards();
  renderEffects();
  renderQueue();
}

export function initBuildings() {
  bus.on('state:changed', render);
  bus.on('time:tick', updateCountdowns);

  render();
}

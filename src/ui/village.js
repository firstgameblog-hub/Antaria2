/** Экран деревни: выбор локации, узлы сбора, действия и карточка задания. */

import { LOCATIONS } from '../../data/locations.js';
import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import {
  availableCharges,
  cancelGather,
  gather,
  getActiveGather,
} from '../systems/gathering.js';
import { getActiveQuest } from '../systems/quests.js';
import {
  REPAIR_COST,
  REPAIR_SECONDS,
  REPAIR_STEP,
  canRepair,
  cancelRepair,
  getActiveRepair,
  palisadePercent,
  startRepair,
} from '../systems/village.js';
import { openAskold, openElder, openHerbalist } from './dialogue.js';
import { el } from './dom.js';
import { openTab } from './panels.js';
import { startSleep } from './sleep.js';

let selected = 'yard';

const ACTIONS = {
  talk_elder: {
    label: 'Поговорить со старостой · Радим',
    run: () => openElder(),
  },

  repair_palisade: {
    label: () => `Починить частокол (${REPAIR_COST} ветки)`,
    disabled: () => !canRepair(),
    hint: () =>
      `Целостность: ${palisadePercent()}%. Ремонт добавляет ` +
      `${Math.round(REPAIR_STEP * 100)}% и занимает ${REPAIR_SECONDS} с. ` +
      `Веток при себе: ${store.state.resources.branch ?? 0}.`,
    run: () => startRepair(),
  },

  open_craft: {
    label: 'К костру — готовить',
    run: () => openTab('craft'),
  },

  talk_herbalist: {
    label: 'Поговорить с Мирной',
    run: () => openHerbalist(),
  },

  open_trade: {
    label: 'Поговорить с Аскольдом',
    run: () => openAskold(),
  },

  sleep: {
    label: 'Лечь спать до утра',
    hint: 'Экран потемнеет, день сменится, узлы сбора обновятся, а крафт дойдёт до готовности.',
    run: () => startSleep(),
  },
};

function visibleLocations() {
  return Object.values(LOCATIONS).filter(
    (location) => location.stageFrom <= store.state.stage,
  );
}

function renderPins() {
  const host = document.querySelector('[data-map-pins]');
  const locations = visibleLocations();

  if (!locations.some((location) => location.id === selected)) {
    selected = locations[0]?.id ?? 'yard';
  }

  const pins = locations.map((location) => {
    const active = location.id === selected;

    const button = el('button', `map-pin${active ? ' is-active' : ''}`);
    button.type = 'button';
    button.style.left = `${location.map?.left ?? 50}%`;
    button.style.top = `${location.map?.top ?? 50}%`;
    button.title = location.description;
    button.setAttribute('aria-pressed', String(active));

    button.append(el('span', 'pin-dot'));
    button.append(el('span', 'pin-label', location.name));

    button.addEventListener('click', () => selectLocation(location.id));

    return button;
  });

  host.replaceChildren(...pins);

  const caption = document.querySelector('[data-location-caption]');
  if (caption) caption.textContent = LOCATIONS[selected]?.name ?? '';
}

function selectLocation(id) {
  selected = id;

  if (
    id === 'yard' &&
    store.state.flags.chapter1_first_steps_done &&
    !store.state.flags.visited_yard_report
  ) {
    store.update((state) => {
      state.flags.visited_yard_report = true;
    });
  }

  render();
}

function renderNode(node) {
  const active = getActiveGather();
  const charges = availableCharges(node.id);

  const card = el('div', 'node-card');
  const main = el('div', 'node-main');
  main.append(el('p', 'node-title', node.title));
  main.append(el('p', 'node-text', node.text));

  if (active && active.nodeId === node.id) {
    card.classList.add('is-gathering');

    const percent = Math.round(active.progress * 100);

    const status = el('div', 'gather-status');
    status.append(el('span', '', 'Собираю…'));
    const percentNode = el('span', 'gather-percent', `${percent}%`);
    percentNode.dataset.gatherPercent = node.id;
    status.append(percentNode);

    const bar = el('div', 'gather-bar');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', String(percent));

    const fill = el('span', 'gather-fill');
    fill.dataset.gatherFill = node.id;
    fill.style.width = `${percent}%`;
    bar.append(fill);

    main.append(status, bar);
    card.append(main);
    return card;
  }

  const button = el('button', 'btn btn-small');
  button.type = 'button';

  if (charges <= 0) {
    button.textContent = 'Собрано до завтра';
    button.disabled = true;
  } else if (active) {
    button.textContent = 'Подождите…';
    button.disabled = true;
  } else {
    button.textContent = `Собрать: ${RESOURCES[node.resource].name} +${charges}`;
    button.addEventListener('click', () => gather(node.id));
  }

  card.append(main, button);
  return card;
}

function updateGatherProgress({ nodeId, progress }) {
  const percent = Math.round(progress * 100);

  const fill = document.querySelector(`[data-gather-fill="${nodeId}"]`);
  const label = document.querySelector(`[data-gather-percent="${nodeId}"]`);

  if (fill) {
    fill.style.width = `${percent}%`;
    fill.closest('.gather-bar')?.setAttribute('aria-valuenow', String(percent));
  }

  if (label) label.textContent = `${percent}%`;
}

function renderRepairProgress(active) {
  const percent = Math.round(active.progress * 100);

  const wrap = el('div', 'action-progress');

  const status = el('div', 'gather-status');
  status.append(el('span', '', 'Чиню частокол…'));

  const percentNode = el('span', 'gather-percent', `${percent}%`);
  percentNode.dataset.repairPercent = '';
  status.append(percentNode);

  const bar = el('div', 'gather-bar');
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  bar.setAttribute('aria-valuenow', String(percent));

  const fill = el('span', 'gather-fill');
  fill.dataset.repairFill = '';
  fill.style.width = `${percent}%`;
  bar.append(fill);

  wrap.append(status, bar);
  return wrap;
}

function updateRepairProgress({ progress }) {
  const percent = Math.round(progress * 100);

  const fill = document.querySelector('[data-repair-fill]');
  const label = document.querySelector('[data-repair-percent]');

  if (fill) {
    fill.style.width = `${percent}%`;
    fill.closest('.gather-bar')?.setAttribute('aria-valuenow', String(percent));
  }

  if (label) label.textContent = `${percent}%`;
}

function renderLocationPanel() {
  const host = document.querySelector('[data-location-panel]');
  const location = LOCATIONS[selected];

  if (!location) {
    host.replaceChildren();
    return;
  }

  const children = [
    el('h3', 'location-title', location.name),
    el('p', 'location-desc', location.description),
  ];

  if (location.nodes?.length) {
    const list = el('div', 'node-list');
    for (const node of location.nodes) list.append(renderNode(node));
    children.push(list);
  }

  if (location.actions?.length) {
    const row = el('div', 'action-row');
    const repairing = getActiveRepair();

    for (const id of location.actions) {
      const action = ACTIONS[id];
      if (!action) continue;
      if (id === 'repair_palisade' && repairing) continue;

      const label = typeof action.label === 'function' ? action.label() : action.label;
      const button = el('button', 'btn', label);
      button.type = 'button';
      button.disabled = action.disabled ? action.disabled() : false;
      button.addEventListener('click', () => action.run());
      row.append(button);
    }

    children.push(row);

    if (repairing) children.push(renderRepairProgress(repairing));

    for (const id of location.actions) {
      if (id === 'repair_palisade' && repairing) continue;

      const action = ACTIONS[id];
      if (!action?.hint) continue;

      const hint = typeof action.hint === 'function' ? action.hint() : action.hint;
      if (hint) children.push(el('p', 'action-hint', hint));
    }
  }

  host.replaceChildren(...children);
}

function renderQuest() {
  const host = document.querySelector('[data-quest]');
  const view = getActiveQuest();

  if (!view) {
    host.hidden = true;
    host.replaceChildren();
    return;
  }

  host.hidden = false;

  const { quest } = view;
  const card = el('section', 'quest-card');

  const head = el('div', 'quest-head');
  head.append(el('h2', 'panel-title', quest.title));
  card.append(head);

  card.append(el('p', 'quest-intro', quest.short ?? ''));

  const list = el('ol', 'quest-steps');

  for (const step of view.steps) {
    const item = el('li', `quest-step${step.done ? ' is-done' : ''}`);
    item.append(el('span', 'quest-mark', step.done ? '✓' : '○'));
    item.append(el('span', 'quest-text', step.text));
    if (step.progress) item.append(el('span', 'quest-progress', step.progress));
    list.append(item);
  }

  card.append(list);

  if (quest.hint) card.append(el('p', 'quest-hint', quest.hint));

  if (quest.rewards?.coin) {
    card.append(
      el('p', 'quest-reward', `Награда: ${quest.rewards.coin} серебра.`),
    );
  }

  host.replaceChildren(card);
}

function render() {
  renderPins();
  renderLocationPanel();
  renderQuest();
}

export function initVillage() {
  bus.on('state:changed', render);
  bus.on('gather:started', render);
  bus.on('gather:finished', render);
  bus.on('gather:progress', updateGatherProgress);

  bus.on('repair:started', render);
  bus.on('repair:finished', render);
  bus.on('repair:progress', updateRepairProgress);

  bus.on('state:loaded', () => {
    cancelGather();
    cancelRepair();
    selected = 'yard';
  });

  render();
}

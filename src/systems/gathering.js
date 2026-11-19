/**
 * Сбор ресурсов: узел отдаёт весь запас за один подход,
 * но подход занимает несколько секунд — с прогрессом в интерфейсе.
 */

import { LOCATIONS } from '../../data/locations.js';
import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { storageCap, storageUsed } from './buildings.js';
import { checkChapterQuest } from './quests.js';

const DEFAULT_GATHER_SECONDS = 2.5;

/** Какой инструмент ускоряет и увеличивает добычу ресурса. */
const TOOL_FOR_RESOURCE = {
  herb: 'knife',
  branch: 'axe',
  stone: 'pickaxe',
};

function toolBonus(resourceId) {
  const tool = TOOL_FOR_RESOURCE[resourceId];
  if (!tool) return 0;
  return (store.state.resources[tool] ?? 0) > 0 ? 1 : 0;
}

/** Текущий сбор: только один за раз. */
let activeGather = null;

export function findNode(nodeId) {
  for (const location of Object.values(LOCATIONS)) {
    const node = (location.nodes ?? []).find((item) => item.id === nodeId);
    if (node) return { location, node };
  }
  return null;
}

/** Сколько ресурса доступно в узле прямо сейчас. */
export function availableCharges(nodeId) {
  const definition = findNode(nodeId)?.node;
  if (!definition) return 0;

  const state = store.state;
  const record = state.nodes[nodeId];

  if (!record) return definition.amount;
  if (record.day !== state.time.day) return definition.amount;

  return Math.max(0, record.charges);
}

/** Текущий сбор с прогрессом 0–1 или null. */
export function getActiveGather() {
  if (!activeGather) return null;

  const elapsed = performance.now() - activeGather.startedAt;
  const progress = Math.min(1, elapsed / activeGather.duration);

  return { nodeId: activeGather.nodeId, progress };
}

/** Начать сбор. Возвращает false, если подход невозможен. */
export function gather(nodeId) {
  if (activeGather) {
    bus.emit('ui:toast', 'Сначала закончите текущий сбор.');
    return false;
  }

  const found = findNode(nodeId);
  if (!found) return false;

  const charges = availableCharges(nodeId);
  if (charges <= 0) {
    bus.emit('ui:toast', 'Здесь уже собрано — новое появится завтра.');
    return false;
  }

  const seconds = found.node.seconds ?? DEFAULT_GATHER_SECONDS;
  const bonus = toolBonus(found.node.resource);
  const used = storageUsed();
  const cap = storageCap();

  if (used + charges + bonus > cap) {
    bus.emit(
      'ui:toast',
      `Склад полон: ${used} / ${cap}. Продайте товар или постройте склад.`,
    );
    return false;
  }

  activeGather = {
    nodeId,
    charges: charges + bonus,
    bonus,
    startedAt: performance.now(),
    duration: Math.max(0.5, seconds) * 1000,
    intervalId: 0,
    timeoutId: 0,
  };

  bus.emit('gather:started', { nodeId, duration: activeGather.duration });

  // Таймер завершает сбор, даже если вкладка не рисует кадры.
  activeGather.timeoutId = window.setTimeout(() => {
    if (activeGather?.nodeId === nodeId) finishGather();
  }, activeGather.duration);

  // Интервал обновляет полосу прогресса; rAF в фоне браузер душит.
  activeGather.intervalId = window.setInterval(() => {
    if (!activeGather || activeGather.nodeId !== nodeId) return;

    const progress = Math.min(
      1,
      (performance.now() - activeGather.startedAt) / activeGather.duration,
    );

    bus.emit('gather:progress', { nodeId, progress });

    if (progress >= 1) finishGather();
  }, 100);

  return true;
}

function finishGather() {
  if (!activeGather) return;

  const job = activeGather;
  activeGather = null;

  clearTimeout(job.timeoutId);
  clearInterval(job.intervalId);

  const found = findNode(job.nodeId);
  if (!found) {
    bus.emit('gather:finished', { nodeId: job.nodeId });
    return;
  }

  const { node } = found;

  store.update((state) => {
    state.nodes[job.nodeId] = { charges: 0, day: state.time.day };
    state.resources[node.resource] =
      (state.resources[node.resource] ?? 0) + job.charges;

    if (node.resource === 'herb') {
      state.stats.herbGathered += job.charges;
    }

    if (node.resource === 'berry') {
      state.stats.berryGathered = (state.stats.berryGathered ?? 0) + job.charges;
    }

    if (node.resource === 'branch') {
      state.stats.branchGathered = (state.stats.branchGathered ?? 0) + job.charges;
    }

    if (node.resource === 'stone') {
      state.stats.stoneGathered = (state.stats.stoneGathered ?? 0) + job.charges;
    }
  });

  bus.emit('gather:finished', { nodeId: job.nodeId });

  const suffix = job.bonus > 0 ? ' — с инструментом' : '';
  bus.emit(
    'ui:toast',
    `Собрано: ${RESOURCES[node.resource].name} +${job.charges}${suffix}.`,
  );
  checkChapterQuest();
}

/** Прервать сбор (загрузка сохранения, новая игра). */
export function cancelGather() {
  if (!activeGather) return;

  const { nodeId, intervalId, timeoutId } = activeGather;
  activeGather = null;
  clearInterval(intervalId);
  clearTimeout(timeoutId);

  bus.emit('gather:finished', { nodeId, cancelled: true });
}

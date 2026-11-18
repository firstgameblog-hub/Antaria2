/** Действия в деревне, не связанные с крафтом и торговлей. */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { checkChapterQuest } from './quests.js';

export const REPAIR_COST = 4;
export const REPAIR_STEP = 0.1;
export const REPAIR_SECONDS = 3.4;

/** Активная починка: одна за раз. */
let activeRepair = null;

function palisadeIntegrity(state = store.state) {
  return state.buildings.palisade?.integrity ?? 0;
}

export function palisadePercent() {
  return Math.round(palisadeIntegrity() * 100);
}

export function canRepair() {
  const state = store.state;
  return palisadeIntegrity(state) < 1 && (state.resources.branch ?? 0) >= REPAIR_COST;
}

export function getActiveRepair() {
  if (!activeRepair) return null;

  const progress = Math.min(
    1,
    (performance.now() - activeRepair.startedAt) / activeRepair.duration,
  );

  return { progress };
}

export function startRepair() {
  if (activeRepair) {
    bus.emit('ui:toast', 'Сначала закончите текущую работу.');
    return false;
  }

  const state = store.state;

  if (palisadeIntegrity(state) >= 1) {
    bus.emit('ui:toast', 'Частокол и так цел.');
    return false;
  }

  if ((state.resources.branch ?? 0) < REPAIR_COST) {
    bus.emit('ui:toast', `Нужно ${REPAIR_COST} ветки.`);
    return false;
  }

  activeRepair = {
    startedAt: performance.now(),
    duration: REPAIR_SECONDS * 1000,
    intervalId: 0,
    timeoutId: 0,
  };

  bus.emit('repair:started');

  activeRepair.intervalId = window.setInterval(() => {
    if (!activeRepair) return;

    const progress = Math.min(
      1,
      (performance.now() - activeRepair.startedAt) / activeRepair.duration,
    );

    bus.emit('repair:progress', { progress });

    if (progress >= 1) finishRepair();
  }, 100);

  activeRepair.timeoutId = window.setTimeout(() => {
    if (activeRepair) finishRepair();
  }, activeRepair.duration);

  return true;
}

function finishRepair() {
  if (!activeRepair) return;

  const job = activeRepair;
  activeRepair = null;

  clearInterval(job.intervalId);
  clearTimeout(job.timeoutId);

  const state = store.state;

  if (palisadeIntegrity(state) >= 1) {
    bus.emit('repair:finished', { cancelled: true });
    return;
  }

  if ((state.resources.branch ?? 0) < REPAIR_COST) {
    bus.emit('repair:finished', { cancelled: true });
    bus.emit('ui:toast', 'Ветки закончились — починка остановлена.');
    return;
  }

  store.update((current) => {
    current.resources.branch -= REPAIR_COST;

    if (!current.buildings.palisade) {
      current.buildings.palisade = { level: 1, count: 1, integrity: 0 };
    }

    current.buildings.palisade.integrity = Math.min(
      1,
      palisadeIntegrity(current) + REPAIR_STEP,
    );
  });

  bus.emit('repair:finished');
  bus.emit('ui:toast', `Частокол у ворот починен: ${palisadePercent()}%.`);

  checkChapterQuest();
}

/** Прервать починку (загрузка сохранения, новая игра). */
export function cancelRepair() {
  if (!activeRepair) return;

  const { intervalId, timeoutId } = activeRepair;
  activeRepair = null;

  clearInterval(intervalId);
  clearTimeout(timeoutId);

  bus.emit('repair:finished', { cancelled: true });
}

/**
 * Сон до утра: следующий день, 07:00.
 * Саму сцену с затемнением показывает ui/sleep.js.
 */
export function advanceToMorning() {
  store.update((state) => {
    state.time.day += 1;
    state.time.minutes = 7 * 60;
  });

  bus.emit('time:day', store.state.time.day);
  bus.emit('time:minute', store.state.time);

  return true;
}

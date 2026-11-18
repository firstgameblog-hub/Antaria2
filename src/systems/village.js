/** Действия в деревне, не связанные с крафтом и торговлей. */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { checkChapterQuest } from './quests.js';

export const REPAIR_COST = 4;
export const REPAIR_STEP = 0.1;

export function palisadePercent() {
  return Math.round((store.state.buildings.palisade ?? 0) * 100);
}

export function canRepair() {
  const state = store.state;
  return (
    state.buildings.palisade < 1 && (state.resources.branch ?? 0) >= REPAIR_COST
  );
}

export function repairPalisade() {
  const state = store.state;

  if (state.buildings.palisade >= 1) {
    bus.emit('ui:toast', 'Частокол и так цел.');
    return false;
  }

  if ((state.resources.branch ?? 0) < REPAIR_COST) {
    bus.emit('ui:toast', `Нужно ${REPAIR_COST} ветки.`);
    return false;
  }

  store.update((current) => {
    current.resources.branch -= REPAIR_COST;
    current.buildings.palisade = Math.min(1, current.buildings.palisade + REPAIR_STEP);
  });

  bus.emit(
    'ui:toast',
    `Частокол у ворот починен: ${palisadePercent()}%.`,
  );

  checkChapterQuest();
  return true;
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

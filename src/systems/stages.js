/** Движок стадий: цели перехода и смена стадии. */

import { QUESTS } from '../../data/quests.js';
import { STAGES } from '../../data/stages.js';
import { bus } from '../core/events.js';
import { addChronicleEntry, store } from '../core/state.js';

export function getNextStage() {
  return STAGES[store.state.stage + 1] ?? null;
}

function questsDone() {
  return Object.keys(QUESTS).filter((id) => Boolean(store.state.flags[`${id}_done`]))
    .length;
}

function goalProgress(goal) {
  const state = store.state;

  switch (goal.type) {
    case 'stats':
      return (goal.stats ?? []).reduce(
        (sum, key) => sum + (state.stats[key] ?? 0),
        0,
      );
    case 'stat':
      return state.stats[goal.stat] ?? 0;
    case 'quests':
      return questsDone();
    case 'building':
      return state.buildings[goal.building]?.[goal.field] ?? 0;
    default:
      return 0;
  }
}

/** Цели текущей стадии с прогрессом. */
export function getStageGoals(stage = store.state.stage) {
  const def = STAGES[stage];

  return (def?.goals ?? []).map((goal) => {
    const raw = goalProgress(goal);

    return {
      ...goal,
      raw,
      progress: Math.min(raw, goal.amount),
      done: raw >= goal.amount,
    };
  });
}

export function canAdvanceStage() {
  const next = getNextStage();
  if (!next) return false;

  const goals = getStageGoals();
  return goals.length > 0 && goals.every((goal) => goal.done);
}

/** Перейти на следующую стадию. Возвращает false, если условия не готовы. */
export function advanceStage() {
  const next = getNextStage();
  if (!next || !canAdvanceStage()) return false;

  store.update((state) => {
    state.stage = next.id;
    state.flags[`stage_${next.id}_entered`] = true;
  });

  addChronicleEntry(
    `Стадия ${next.id}: ${next.name}`,
    `Деревня выросла — теперь это ${next.name.toLowerCase()}. ` +
      `Началась глава «${next.chapter}».`,
  );

  bus.emit('stage:changed', next.id);
  return true;
}

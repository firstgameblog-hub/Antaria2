/**
 * Квест первой главы: письмо отца.
 * Шаги берутся из data/quests.js, прогресс считается по состоянию.
 */

import { QUESTS } from '../../data/quests.js';
import { bus } from '../core/events.js';
import { addChronicleEntry, store } from '../core/state.js';

const QUEST_ID = 'chapter1_first_steps';

export function isStepDone(step, state) {
  if (step.flag) return Boolean(state.flags[step.flag]);
  if (step.counter === 'palisade') {
    return (state.buildings.palisade?.integrity ?? 0) >= step.target;
  }
  if (step.counter === 'herb') return state.stats.herbGathered >= step.target;
  return false;
}

/** Данные для отрисовки карточки задания. */
export function getQuestView() {
  const quest = QUESTS[QUEST_ID];
  const state = store.state;

  const steps = quest.steps.map((step) => {
    let progress = null;

    if (step.counter === 'palisade') {
      const integrity = state.buildings.palisade?.integrity ?? 0;
      progress = `${Math.round(integrity * 100)}% из ${Math.round(step.target * 100)}%`;
    } else if (step.counter === 'herb') {
      progress = `${Math.min(state.stats.herbGathered, step.target)} из ${step.target}`;
    }

    return { ...step, done: isStepDone(step, state), progress };
  });

  return {
    quest,
    steps,
    done: Boolean(state.flags[`${QUEST_ID}_done`]),
  };
}

/** Закрыть квест, если все шаги выполнены. Возвращает true при закрытии. */
export function checkChapterQuest() {
  const view = getQuestView();
  if (view.done) return false;
  if (!view.steps.every((step) => step.done)) return false;

  const { rewards } = view.quest;

  store.update((state) => {
    state.flags[`${QUEST_ID}_done`] = true;

    if (rewards.flag) state.flags[rewards.flag] = true;
    if (rewards.coin) state.resources.coin += rewards.coin;
  });

  addChronicleEntry(
    'Поручение старосты',
    'Травы собраны, частокол у ворот держится, разговор с Мирной состоялся. ' +
      'Деревня сделала первый шаг — и записала его в летопись.',
  );

  bus.emit('ui:toast', `Поручение выполнено: +${rewards.coin} серебра.`);
  return true;
}

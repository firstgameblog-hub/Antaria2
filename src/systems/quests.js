/**
 * Квесты-истории: прогресс, активный квест и закрытие первого поручения.
 * Цепочка после письма: двор старосты → Аскольд → заказ из Лозичей.
 */

import { QUESTS } from '../../data/quests.js';
import { bus } from '../core/events.js';
import { addChronicleEntry, store } from '../core/state.js';

const FIRST_QUEST_ID = 'chapter1_first_steps';

export function isStepDone(step, state) {
  if (step.flag) return Boolean(state.flags[step.flag]);

  if (step.counter === 'palisade') {
    return (state.buildings.palisade?.integrity ?? 0) >= step.target;
  }

  return (state.resources[step.counter] ?? 0) >= step.target;
}

/** Данные для карточки квеста. */
export function getQuestView(quest) {
  const state = store.state;

  const steps = quest.steps.map((step) => {
    let progress = null;

    if (step.counter === 'palisade') {
      const integrity = state.buildings.palisade?.integrity ?? 0;
      progress = `${Math.round(integrity * 100)}% из ${Math.round(step.target * 100)}%`;
    } else if (step.counter) {
      const have = state.resources[step.counter] ?? 0;
      progress = `${Math.min(have, step.target)} из ${step.target}`;
    }

    return { ...step, done: isStepDone(step, state), progress };
  });

  return {
    quest,
    steps,
    done: steps.every((step) => step.done),
  };
}

export function getQuestViewById(id) {
  const quest = QUESTS[id];
  return quest ? getQuestView(quest) : null;
}

/** Какой квест сейчас показывать в деревне. */
export function getActiveQuest() {
  const flags = store.state.flags;

  if (!flags[`${FIRST_QUEST_ID}_done`]) {
    return getQuestViewById(FIRST_QUEST_ID);
  }

  if (!flags.elder_reported) {
    return getQuestViewById('chapter1_report');
  }

  if (!flags.askold_briefed) {
    return getQuestViewById('chapter1_askold');
  }

  if (!flags.askold_order_done) {
    return getQuestViewById('chapter1_order');
  }

  return null;
}

/** Закрыть первое поручение старосты, когда все шаги выполнены. */
export function checkChapterQuest() {
  const view = getQuestViewById(FIRST_QUEST_ID);
  if (!view || view.done === false) return false;

  const flags = store.state.flags;
  if (flags[`${FIRST_QUEST_ID}_done`]) return false;

  const { rewards } = view.quest;

  store.update((state) => {
    state.flags[`${FIRST_QUEST_ID}_done`] = true;

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

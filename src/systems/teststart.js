/**
 * Тестовый старт со второй стадии.
 * Нужен для проверки контента второй главы без прохождения первой.
 * В обычной игре не используется.
 */

import { bus } from '../core/events.js';
import { createInitialState, store } from '../core/state.js';
import { save } from '../core/storage.js';

export function createStageTwoTestState() {
  const state = createInitialState();

  state.stage = 2;
  state.population = 20;
  state.time.day = 1;
  state.time.minutes = 8 * 60;

  state.resources = {
    herb: 20,
    berry: 10,
    branch: 80,
    stone: 60,
    planks: 6,
    coin: 200,
    potion: 0,
    dried_berries: 0,
    meat: 0,
    hide: 0,
    knife: 0,
    axe: 0,
    pickaxe: 0,
  };

  state.buildings.palisade.integrity = 0.7;

  state.flags = {
    chapter1_intro_done: true,
    chapter1_chronicle: true,
    chapter1_steps_started: true,
    chapter1_first_steps_done: true,
    chapter1_reply: 'neutral',
    met_herbalist: true,
    herbalist_gift: true,
    visited_yard_report: true,
    elder_reported: true,
    askold_briefed: true,
    askold_order_done: true,
    visited_yard_final: true,
    elder_final_report: true,
  };

  state.stats = {
    herbGathered: 0,
    berryGathered: 0,
    branchGathered: 0,
    stoneGathered: 0,
    coinsEarned: 0,
  };

  state.chronicle = [
    {
      id: 'ch-test',
      day: 1,
      title: 'Тестовый старт: стадия II',
      text:
        'Первая глава пройдена для проверки. Деревня окрепла, кузница ещё не построена. ' +
        'Дальше — вторая стадия.',
    },
  ];

  return state;
}

export function startStageTwoTest() {
  store.replace(createStageTwoTestState());
  save('auto');
  bus.emit('ui:toast', 'Тестовый старт со второй стадии.');
}

export function giveTestMaterials() {
  store.update((state) => {
    state.resources.branch += 100;
    state.resources.stone += 80;
    state.resources.planks += 5;
    state.resources.herb += 20;
    state.resources.berry += 10;
    state.resources.coin += 100;
  });

  save('auto');
  bus.emit('ui:toast', 'Тестовые материалы выданы.');
}

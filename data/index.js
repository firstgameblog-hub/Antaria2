/**
 * Единая точка доступа к данным и проверка ссылок между справочниками.
 * Вызывается при старте и через `npm run check`.
 */

import { RESOURCES } from './resources.js';
import { BUILDINGS } from './buildings.js';
import { RECIPES } from './recipes.js';
import { STAGES } from './stages.js';
import { QUESTS } from './quests.js';
import { LOCATIONS } from './locations.js';
import { TRADERS } from './traders.js';
import { CHAPTER1 } from './chapter1.js';

export const DATA = {
  resources: RESOURCES,
  buildings: BUILDINGS,
  recipes: RECIPES,
  stages: STAGES,
  quests: QUESTS,
  locations: LOCATIONS,
  traders: TRADERS,
  chapter1: CHAPTER1,
};

function listStations() {
  const stations = new Set();

  for (const building of Object.values(BUILDINGS)) {
    for (const level of building.levels ?? []) {
      for (const station of level.effects?.craftStations ?? []) {
        stations.add(station);
      }
    }
  }

  return stations;
}

/**
 * Проверить целостность данных.
 * @returns {string[]} список проблем (пустой — всё в порядке)
 */
export function validateData() {
  const problems = [];
  const stations = listStations();

  for (const recipe of Object.values(RECIPES)) {
    for (const id of Object.keys(recipe.ingredients)) {
      if (!RESOURCES[id]) problems.push(`Рецепт "${recipe.id}": нет ресурса "${id}" в ингредиентах`);
    }
    for (const id of Object.keys(recipe.output)) {
      if (!RESOURCES[id]) problems.push(`Рецепт "${recipe.id}": нет ресурса "${id}" в результате`);
    }
    for (const stage of recipe.stages) {
      if (!STAGES[stage]) problems.push(`Рецепт "${recipe.id}": нет стадии ${stage}`);
    }
    if (recipe.station && !stations.has(recipe.station)) {
      problems.push(`Рецепт "${recipe.id}": нет станции "${recipe.station}"`);
    }
  }

  const effectKeys = new Set([
    'housing',
    'storage',
    'defense',
    'comfort',
    'food',
    'craftStations',
  ]);

  for (const building of Object.values(BUILDINGS)) {
    if (!STAGES[building.stageFrom]) {
      problems.push(`Постройка "${building.id}": нет стадии ${building.stageFrom}`);
    }

    const levels = Array.isArray(building.levels) ? building.levels : [];

    if (building.buildable !== false && levels.length === 0) {
      problems.push(`Постройка "${building.id}": нет уровней`);
    }

    if (levels.length && building.startLevel > levels.length) {
      problems.push(`Постройка "${building.id}": стартовый уровень вне диапазона`);
    }

    if (
      building.unique === false &&
      building.buildable !== false &&
      !Number.isFinite(building.startCount)
    ) {
      problems.push(`Постройка "${building.id}": нет стартового количества`);
    }

    for (const level of levels) {
      if (!level.name) {
        problems.push(`Постройка "${building.id}": у уровня нет названия`);
      }

      if (!Number.isFinite(level.minutes) || level.minutes <= 0) {
        problems.push(`Постройка "${building.id}": некорректное время стройки`);
      }

      for (const id of Object.keys(level.cost ?? {})) {
        if (!RESOURCES[id]) {
          problems.push(`Постройка "${building.id}": нет ресурса "${id}" в цене`);
        }
      }

      for (const key of Object.keys(level.effects ?? {})) {
        if (!effectKeys.has(key)) {
          problems.push(`Постройка "${building.id}": неизвестный эффект "${key}"`);
        }
      }
    }
  }

  for (const quest of Object.values(QUESTS)) {
    if (!STAGES[quest.chapter]) {
      problems.push(`Квест "${quest.id}": нет главы ${quest.chapter}`);
    }
    for (const step of quest.steps) {
      if (step.flag !== undefined) continue;
      if (step.counter !== 'palisade' && !RESOURCES[step.counter]) {
        problems.push(`Квест "${quest.id}": неизвестный счётчик "${step.counter}"`);
      }
    }
  }

  const nodeIds = new Set();

  for (const location of Object.values(LOCATIONS)) {
    if (!STAGES[location.stageFrom]) {
      problems.push(`Локация "${location.id}": нет стадии ${location.stageFrom}`);
    }

    if (
      !location.map ||
      !Number.isFinite(location.map.left) ||
      !Number.isFinite(location.map.top) ||
      location.map.left < 0 ||
      location.map.left > 100 ||
      location.map.top < 0 ||
      location.map.top > 100
    ) {
      problems.push(`Локация "${location.id}": некорректные координаты карты`);
    }

    for (const node of location.nodes ?? []) {
      if (nodeIds.has(node.id)) problems.push(`Узел "${node.id}" встречается дважды`);
      nodeIds.add(node.id);

      if (!RESOURCES[node.resource]) {
        problems.push(`Узел "${node.id}": нет ресурса "${node.resource}"`);
      }
      if (!Number.isFinite(node.amount) || node.amount <= 0) {
        problems.push(`Узел "${node.id}": некорректное количество`);
      }
      if (
        node.seconds !== undefined &&
        (!Number.isFinite(node.seconds) || node.seconds <= 0)
      ) {
        problems.push(`Узел "${node.id}": некорректная длительность сбора`);
      }
    }
  }

  for (const trader of Object.values(TRADERS)) {
    for (const id of Object.keys(trader.stock)) {
      if (!RESOURCES[id]) problems.push(`Торговец "${trader.id}": нет ресурса "${id}" в запасе`);
    }
  }

  if (!Array.isArray(CHAPTER1.pages) || CHAPTER1.pages.length === 0) {
    problems.push('Глава 1: нет страниц');
  }

  for (const stage of Object.values(STAGES)) {
    for (const goal of stage.goals ?? []) {
      if (!goal.label) {
        problems.push(`Стадия ${stage.id}: у цели нет описания`);
      }

      if (!Number.isFinite(goal.amount) || goal.amount <= 0) {
        problems.push(`Стадия ${stage.id}: некорректная цель "${goal.id}"`);
      }

      if (!['stats', 'stat', 'quests', 'building'].includes(goal.type)) {
        problems.push(`Стадия ${stage.id}: неизвестный тип цели "${goal.type}"`);
      }

      if (goal.type === 'building' && !BUILDINGS[goal.building]) {
        problems.push(`Стадия ${stage.id}: нет постройки "${goal.building}" в цели`);
      }
    }
  }

  const stageIds = Object.values(STAGES)
    .map((stage) => stage.id)
    .sort((a, b) => a - b);

  if (stageIds.join(',') !== '1,2,3,4,5,6,7') {
    problems.push(`Стадии должны идти с 1 по 7, получено: ${stageIds.join(',')}`);
  }

  return problems;
}

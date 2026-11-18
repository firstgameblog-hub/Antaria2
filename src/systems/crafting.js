/** Крафт: рецепт занимает игровое время, результат появляется в сумке. */

import { RECIPES } from '../../data/recipes.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { absoluteMinutes } from '../core/time.js';

export function canCraft(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;

  return Object.entries(recipe.ingredients).every(
    ([id, quantity]) => (store.state.resources[id] ?? 0) >= quantity,
  );
}

export function craft(recipeId) {
  const recipe = RECIPES[recipeId];
  if (!recipe) return false;

  if (!canCraft(recipeId)) {
    bus.emit('ui:toast', 'Не хватает припасов.');
    return false;
  }

  store.update((state) => {
    for (const [id, quantity] of Object.entries(recipe.ingredients)) {
      state.resources[id] -= quantity;
    }

    state.crafting.push({
      id: `craft-${Date.now()}-${state.crafting.length}`,
      recipeId,
      endsAt: absoluteMinutes(state) + recipe.minutes,
    });
  });

  bus.emit('ui:toast', `Готовится: ${recipe.name}.`);
  return true;
}

export function remainingMinutes(job) {
  return job.endsAt - absoluteMinutes(store.state);
}

/** Завершить всё, что уже готово. Вызывается на каждой игровой минуте. */
export function processCrafting() {
  const state = store.state;
  if (!state.crafting.length) return;

  const now = absoluteMinutes(state);
  const finished = state.crafting.filter((job) => job.endsAt <= now);
  if (!finished.length) return;

  store.update((current) => {
    for (const job of finished) {
      const recipe = RECIPES[job.recipeId];
      if (!recipe) continue;

      for (const [id, quantity] of Object.entries(recipe.output)) {
        current.resources[id] = (current.resources[id] ?? 0) + quantity;
      }
    }

    current.crafting = current.crafting.filter(
      (job) => !finished.some((done) => done.id === job.id),
    );
  });

  for (const job of finished) {
    const recipe = RECIPES[job.recipeId];
    if (recipe) bus.emit('ui:toast', `Готово: ${recipe.name}.`);
  }
}

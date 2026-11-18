/** Экран крафта: рецепты, проверка ингредиентов и очередь готовки. */

import { RECIPES } from '../../data/recipes.js';
import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { absoluteMinutes, formatDuration } from '../core/time.js';
import { canCraft, craft, remainingMinutes } from '../systems/crafting.js';
import { el } from './dom.js';

const STATION_NAMES = {
  campfire: 'Костёр',
  smithy: 'Кузница',
};

function visibleRecipes() {
  return Object.values(RECIPES).filter(
    (recipe) => Math.min(...recipe.stages) <= store.state.stage,
  );
}

function renderRecipes() {
  const host = document.querySelector('[data-recipes]');

  host.replaceChildren(
    ...visibleRecipes().map((recipe) => {
      const card = el('article', 'recipe-card');

      const head = el('div', 'recipe-head');
      head.append(el('h3', 'recipe-name', recipe.name));
      head.append(el('span', 'recipe-station', STATION_NAMES[recipe.station] ?? recipe.station));
      card.append(head);

      card.append(el('p', 'recipe-lore', recipe.lore));

      const ingredients = el('div', 'ingredients');
      for (const [id, need] of Object.entries(recipe.ingredients)) {
        const have = store.state.resources[id] ?? 0;
        ingredients.append(
          el(
            'span',
            `ingredient${have < need ? ' is-missing' : ''}`,
            `${RESOURCES[id].name} ${have}/${need}`,
          ),
        );
      }
      card.append(ingredients);

      const total = Object.entries(recipe.output)
        .map(([id, quantity]) => `${RESOURCES[id].name} ×${quantity}`)
        .join(', ');

      const foot = el('div', 'recipe-foot');
      foot.append(el('span', 'recipe-time', `${formatDuration(recipe.minutes)} · ${total}`));

      const button = el('button', 'btn', 'Готовить');
      button.type = 'button';
      button.disabled = !canCraft(recipe.id);
      button.addEventListener('click', () => craft(recipe.id));
      foot.append(button);

      card.append(foot);
      return card;
    }),
  );
}

function renderQueue() {
  const host = document.querySelector('[data-craft-queue]');
  const jobs = store.state.crafting;

  if (!jobs.length) {
    host.replaceChildren(el('li', 'muted', 'Пока ничего не готовится.'));
    return;
  }

  host.replaceChildren(
    ...jobs.map((job) => {
      const recipe = RECIPES[job.recipeId];
      const item = el('li');

      item.append(el('span', 'queue-name', recipe?.name ?? 'Неизвестный рецепт'));

      const eta = el('span', 'queue-eta');
      eta.dataset.eta = String(job.endsAt);
      eta.textContent = formatDuration(remainingMinutes(job));
      item.append(eta);

      return item;
    }),
  );
}

function updateCountdowns() {
  const now = absoluteMinutes(store.state);

  for (const node of document.querySelectorAll('[data-eta]')) {
    const remaining = Number(node.dataset.eta) - now;
    const text = remaining > 0 ? formatDuration(remaining) : 'вот-вот';

    if (node.textContent !== text) node.textContent = text;
  }
}

export function initCraft() {
  bus.on('state:changed', () => {
    renderRecipes();
    renderQueue();
  });
  bus.on('time:tick', updateCountdowns);

  renderRecipes();
  renderQueue();
}

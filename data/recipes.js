/**
 * Реестр рецептов.
 *
 * station — станция, на которой готовится (см. BUILDINGS.effects.craftStations).
 * ingredients/output — id ресурсов из RESOURCES.
 * minutes — время приготовления в игровых минутах.
 */

export const RECIPES = {
  herb_potion: {
    id: 'herb_potion',
    name: 'Отвар из трав',
    station: 'campfire',
    minutes: 30,
    stages: [1],
    ingredients: { herb: 2 },
    output: { potion: 1 },
    lore: 'Мирна говорит: кипятить, пока не станет горько. Потом ещё немного.',
  },
  dried_berries: {
    id: 'dried_berries',
    name: 'Вяленые ягоды',
    station: 'campfire',
    minutes: 25,
    stages: [1],
    ingredients: { berry: 3 },
    output: { dried_berries: 1 },
    lore: 'Ягоды, растянутые на доске над углями. Дорога любит такую еду.',
  },
  wooden_planks: {
    id: 'wooden_planks',
    name: 'Доски',
    station: 'smithy',
    minutes: 40,
    stages: [2],
    ingredients: { branch: 4 },
    output: { planks: 1 },
    lore: 'Из кривых веток — ровные доски. Так начинается любая настоящая стройка.',
  },
};

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
  dried_meat: {
    id: 'dried_meat',
    name: 'Вяленое мясо',
    station: 'campfire',
    minutes: 35,
    stages: [2],
    ingredients: { meat: 2 },
    output: { dried_meat: 1 },
    lore: 'Мясо над углями, соль и немного времени. Дорога любит такую еду.',
  },
  knife: {
    id: 'knife',
    name: 'Нож',
    station: 'smithy',
    minutes: 45,
    stages: [2],
    ingredients: { planks: 1, branch: 2 },
    output: { knife: 1 },
    lore: 'Первый настоящий инструмент. Кузнец говорит: с ножа начинается мастер.',
  },
  axe: {
    id: 'axe',
    name: 'Топор',
    station: 'smithy',
    minutes: 60,
    stages: [2],
    ingredients: { planks: 2, branch: 3 },
    output: { axe: 1 },
    lore: 'Тяжёлый, с широким лезвием. Лес уважает такой инструмент.',
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Кирка',
    station: 'smithy',
    minutes: 60,
    stages: [2],
    ingredients: { planks: 2, stone: 3 },
    output: { pickaxe: 1 },
    lore: 'Кирка для камня. С ней брод перестаёт быть просто бродом.',
  },
  herbal_brew: {
    id: 'herbal_brew',
    name: 'Двойной отвар',
    station: 'herb_hut',
    minutes: 50,
    stages: [2],
    ingredients: { herb: 4, berry: 1 },
    output: { potion: 2 },
    lore: 'Мирна говорит: в тепле и трава отдаёт вдвое больше. Две порции из одного котла.',
  },
};

/**
 * Реестр ресурсов и товаров.
 *
 * stages — с какой стадии ресурс доступен (для фильтрации интерфейса).
 * price — базовая цена в серебре (торговля появится на этапе 2).
 */

export const RESOURCES = {
  herb: {
    id: 'herb',
    name: 'Травы',
    kind: 'plant',
    stages: [1],
    price: 2,
    lore: 'Полевые травы, которые Мирна сушит над очагом. Пахнут горько и немного дымом.',
  },
  berry: {
    id: 'berry',
    name: 'Ягоды',
    kind: 'plant',
    stages: [1],
    price: 3,
    lore: 'Кислые лесные ягоды. Летом их хватает, зимой о них вспоминают с тоской.',
  },
  branch: {
    id: 'branch',
    name: 'Ветки',
    kind: 'wood',
    stages: [1],
    price: 1,
    lore: 'Сухие ветки для костра и мелкого ремонта. Добра в лесу много, рук мало.',
  },
  coin: {
    id: 'coin',
    name: 'Серебро',
    kind: 'currency',
    stages: [1],
    price: 1,
    lore: 'Монеты, которые в этой деревне давно не звенели.',
  },
  potion: {
    id: 'potion',
    name: 'Отвар',
    kind: 'product',
    stages: [1],
    price: 8,
    lore: 'Горький отвар из трав. Лечит простуду и, если верить Мирне, дурные мысли.',
  },
  dried_berries: {
    id: 'dried_berries',
    name: 'Вяленые ягоды',
    kind: 'product',
    stages: [1],
    price: 6,
    lore: 'Ягоды, провяленные над огнём. Дороже свежих, потому что не портятся в дороге.',
  },
  stone: {
    id: 'stone',
    name: 'Камень',
    kind: 'mineral',
    stages: [2],
    price: 2,
    lore: 'Валуны с края поля. Из них выйдут фундаменты, печи и первые настоящие стены.',
  },
  planks: {
    id: 'planks',
    name: 'Доски',
    kind: 'material',
    stages: [2],
    price: 4,
    lore: 'Ровные доски вместо кривых веток. С них начинается любая настоящая стройка.',
  },
  iron: {
    id: 'iron',
    name: 'Железо',
    kind: 'mineral',
    stages: [3],
    price: 12,
    lore: 'Крицы и полосы железа. Пока их приходится покупать — своей руды у деревни нет.',
  },
  copper: {
    id: 'copper',
    name: 'Медь',
    kind: 'mineral',
    stages: [4],
    price: 8,
    lore: 'Мягкий металл для котлов, украшений и хитрых механизмов.',
  },
};

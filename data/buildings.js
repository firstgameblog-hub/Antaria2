/**
 * Реестр построек.
 *
 * У каждой постройки есть уровни. Уникальные улучшаются по одному,
 * повторяемые (дом, поле) строятся поштучно.
 *
 * startLevel / startCount — с чем деревня начинает игру.
 * buildable: false — постройка есть, но не строится через очередь (частокол).
 */

export const BUILDINGS = {
  elder_hut: {
    id: 'elder_hut',
    name: 'Лачуга старосты',
    category: 'housing',
    stageFrom: 1,
    unique: true,
    startLevel: 1,
    levels: [
      {
        name: 'Лачуга старосты',
        cost: { branch: 20, coin: 10 },
        minutes: 90,
        effects: { housing: 4, comfort: 1 },
      },
      {
        name: 'Дом старосты',
        cost: { branch: 40, stone: 20, coin: 25 },
        minutes: 180,
        effects: { housing: 8, comfort: 2 },
      },
      {
        name: 'Особняк старосты',
        cost: { branch: 80, stone: 60, planks: 10, coin: 60 },
        minutes: 360,
        effects: { housing: 16, comfort: 3 },
      },
    ],
    lore: 'Низкая изба с потемневшими балками. Здесь родился Зар — и здесь он проснулся не собой.',
  },

  house: {
    id: 'house',
    name: 'Жилой дом',
    category: 'housing',
    stageFrom: 1,
    unique: false,
    startLevel: 1,
    startCount: 8,
    levels: [
      {
        name: 'Лачуга',
        cost: { branch: 10, coin: 5 },
        minutes: 90,
        effects: { housing: 3 },
      },
    ],
    lore: 'Ветхие дома, в которых ютится деревня. Часть стоит пустой после мора.',
  },

  campfire: {
    id: 'campfire',
    name: 'Костёр',
    category: 'craft',
    stageFrom: 1,
    unique: true,
    startLevel: 1,
    levels: [
      {
        name: 'Костёр',
        cost: { branch: 10 },
        minutes: 45,
        effects: { comfort: 1, craftStations: ['campfire'] },
      },
      {
        name: 'Костровой навес',
        cost: { branch: 15, stone: 10, coin: 5 },
        minutes: 60,
        effects: { comfort: 2, craftStations: ['campfire'] },
      },
    ],
    lore: 'Сердце деревни. У огня готовят, греются и говорят о том, что будет завтра.',
  },

  field: {
    id: 'field',
    name: 'Поле',
    category: 'food',
    stageFrom: 1,
    unique: false,
    startLevel: 1,
    startCount: 2,
    levels: [
      {
        name: 'Поле',
        cost: { branch: 8, coin: 3 },
        minutes: 60,
        effects: { food: 1 },
      },
    ],
    lore: 'Заброшенные полосы земли. Их расчистят, когда у деревни появятся силы.',
  },

  watchtower: {
    id: 'watchtower',
    name: 'Смотровая вышка',
    category: 'defense',
    stageFrom: 1,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Смотровая вышка',
        cost: { branch: 6, coin: 2 },
        minutes: 45,
        effects: { defense: 3 },
      },
    ],
    lore: 'С высокой жерди видно дорогу и лес. Тот, кто дежурит, успеет крикнуть.',
  },

  palisade: {
    id: 'palisade',
    name: 'Частокол',
    category: 'defense',
    stageFrom: 1,
    unique: true,
    buildable: false,
    startLevel: 1,
    startIntegrity: 0.6,
    levels: [],
    lore: 'Сгнившие брёвна, которые когда-то защищали деревню. Чинится у ворот.',
  },

  barn: {
    id: 'barn',
    name: 'Склад',
    category: 'storage',
    stageFrom: 2,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Склад',
        cost: { branch: 60, stone: 40, coin: 20 },
        minutes: 240,
        effects: { storage: 200 },
      },
    ],
    lore: 'Первое место, где добро не пропадает под дождём.',
  },

  smithy: {
    id: 'smithy',
    name: 'Кузница',
    category: 'craft',
    stageFrom: 2,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Кузница',
        cost: { branch: 80, stone: 60, coin: 30 },
        minutes: 300,
        effects: { comfort: 1, craftStations: ['smithy'] },
      },
    ],
    lore: 'Горн, наковальня и человек, который умеет с ними обращаться.',
  },

  herb_hut: {
    id: 'herb_hut',
    name: 'Дом травника',
    category: 'craft',
    stageFrom: 2,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Дом травника',
        cost: { branch: 50, stone: 20, coin: 15 },
        minutes: 180,
        effects: { comfort: 1, craftStations: ['herb_hut'] },
      },
    ],
    lore: 'Пучки трав под потолком, полки с банками и запах, от которого кружится голова.',
  },

  market: {
    id: 'market',
    name: 'Рынок',
    category: 'trade',
    stageFrom: 3,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Рынок под навесом',
        cost: { branch: 100, stone: 40, planks: 20, coin: 60 },
        minutes: 300,
        effects: { comfort: 2, storage: 50 },
      },
    ],
    lore: 'Прилавки, вывески и шум, к которому деревня отвыкла.',
  },

  hunter_lodge: {
    id: 'hunter_lodge',
    name: 'Охотничий домик',
    category: 'craft',
    stageFrom: 3,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Охотничий домик',
        cost: { branch: 70, stone: 20, planks: 10, coin: 30 },
        minutes: 240,
        effects: { comfort: 1, food: 1 },
      },
    ],
    lore: 'Шкуры на стенах, копчёное мясо под потолком и запах хвои.',
  },

  town_hall: {
    id: 'town_hall',
    name: 'Ратуша',
    category: 'civic',
    stageFrom: 4,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Ратуша',
        cost: { branch: 150, stone: 120, planks: 40, coin: 120 },
        minutes: 480,
        effects: { comfort: 3 },
      },
    ],
    lore: 'Каменный фундамент, высокое крыльцо и место, где решают дела города.',
  },

  barracks: {
    id: 'barracks',
    name: 'Казарма',
    category: 'defense',
    stageFrom: 4,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Казарма',
        cost: { branch: 120, stone: 100, planks: 30, coin: 80 },
        minutes: 420,
        effects: { defense: 15, comfort: 1 },
      },
    ],
    lore: 'Ополчение получает крышу, место для сна и двор для учений.',
  },

  workshop: {
    id: 'workshop',
    name: 'Мастерская',
    category: 'craft',
    stageFrom: 4,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Мастерская ремесленников',
        cost: { branch: 120, stone: 80, planks: 40, coin: 90 },
        minutes: 360,
        effects: { comfort: 1, craftStations: ['workshop'] },
      },
    ],
    lore: 'Верстаки, инструменты и люди, которые умеют делать сложное простыми руками.',
  },

  trade_guild: {
    id: 'trade_guild',
    name: 'Гильдия торговцев',
    category: 'trade',
    stageFrom: 5,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Гильдия торговцев',
        cost: { stone: 150, planks: 60, coin: 200 },
        minutes: 480,
        effects: { comfort: 2, storage: 100 },
      },
    ],
    lore: 'Дальние маршруты, счётные книги и люди, которые знают цену всему.',
  },

  craft_guild: {
    id: 'craft_guild',
    name: 'Гильдия ремесленников',
    category: 'craft',
    stageFrom: 5,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Гильдия ремесленников',
        cost: { stone: 150, planks: 60, coin: 200 },
        minutes: 480,
        effects: { comfort: 1, craftStations: ['guild'] },
      },
    ],
    lore: 'Уставы, образцы и секреты, которые передают только своим.',
  },

  temple: {
    id: 'temple',
    name: 'Храм',
    category: 'civic',
    stageFrom: 5,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Храм',
        cost: { stone: 200, planks: 40, copper: 40, coin: 250 },
        minutes: 600,
        effects: { comfort: 3 },
      },
    ],
    lore: 'Тишина, свечи и место, где можно выговориться, не боясь осуждения.',
  },

  stone_walls: {
    id: 'stone_walls',
    name: 'Каменные стены',
    category: 'defense',
    stageFrom: 5,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Каменные стены',
        cost: { stone: 400, coin: 300 },
        minutes: 720,
        effects: { defense: 40 },
      },
    ],
    lore: 'Стены вместо частокола. Дорого, долго и надёжно.',
  },

  academy: {
    id: 'academy',
    name: 'Академия',
    category: 'civic',
    stageFrom: 6,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Академия наук',
        cost: { stone: 300, planks: 80, coin: 400 },
        minutes: 720,
        effects: { comfort: 2 },
      },
    ],
    lore: 'Учёные, чертежи и споры до утра. Здесь придумывают то, чего ещё нет.',
  },

  palace: {
    id: 'palace',
    name: 'Дворец',
    category: 'housing',
    stageFrom: 6,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Дворец старосты',
        cost: { stone: 400, planks: 100, coin: 600 },
        minutes: 900,
        effects: { housing: 20, comfort: 4 },
      },
    ],
    lore: 'Дом, который больше не стыдно показать соседям и послам.',
  },

  arsenal: {
    id: 'arsenal',
    name: 'Арсенал',
    category: 'defense',
    stageFrom: 6,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Арсенал',
        cost: { stone: 250, iron: 100, coin: 300 },
        minutes: 600,
        effects: { defense: 15, craftStations: ['arsenal'] },
      },
    ],
    lore: 'Стойки с оружием, сундуки со снаряжением и вечный запах масла.',
  },

  archive: {
    id: 'archive',
    name: 'Архив',
    category: 'civic',
    stageFrom: 7,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Архив',
        cost: { stone: 200, planks: 60, coin: 400 },
        minutes: 600,
        effects: { comfort: 2 },
      },
    ],
    lore: 'Летописи, грамоты и всё, что город помнит о себе.',
  },

  portal: {
    id: 'portal',
    name: 'Портал',
    category: 'special',
    stageFrom: 7,
    unique: true,
    startLevel: 0,
    levels: [
      {
        name: 'Портал',
        cost: { stone: 500, iron: 200, coin: 1000 },
        minutes: 1440,
        effects: {},
      },
    ],
    lore: 'То, что нельзя построить. Можно только открыть — и выбрать, куда шагнуть.',
  },
};

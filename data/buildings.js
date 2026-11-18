/**
 * Реестр построек.
 *
 * stageFrom — стадия, с которой постройка существует.
 * effects — что постройка даёт деревне (жильё, защита, станции крафта).
 * cost — стоимость постройки в ресурсах (заполняется на этапе 3).
 */

export const BUILDINGS = {
  elder_hut: {
    id: 'elder_hut',
    name: 'Лачуга старосты',
    stageFrom: 1,
    unique: true,
    effects: { housing: 2 },
    cost: { branch: 20 },
    lore: 'Низкая изба с потемневшими балками. Здесь родился Зар — и здесь он проснулся не собой.',
  },
  house: {
    id: 'house',
    name: 'Жилой дом',
    stageFrom: 1,
    unique: false,
    effects: { housing: 10 },
    cost: { branch: 40 },
    lore: 'Ветхие дома, в которых ютится деревня. Часть стоит пустой после мора.',
  },
  campfire: {
    id: 'campfire',
    name: 'Костёр',
    stageFrom: 1,
    unique: true,
    effects: { craftStations: ['campfire'] },
    cost: { branch: 10 },
    lore: 'Сердце деревни. У огня готовят, греются и говорят о том, что будет завтра.',
  },
  palisade: {
    id: 'palisade',
    name: 'Частокол',
    stageFrom: 1,
    unique: true,
    effects: { defense: 1 },
    cost: { branch: 60 },
    lore: 'Сгнившие брёвна, которые когда-то защищали деревню. Сейчас — скорее напоминание.',
  },
  field: {
    id: 'field',
    name: 'Поле',
    stageFrom: 1,
    unique: false,
    effects: { food: 1 },
    cost: { branch: 30 },
    lore: 'Заброшенные полосы земли. Их расчистят, когда у деревни появятся силы.',
  },
  barn: {
    id: 'barn',
    name: 'Склад',
    stageFrom: 2,
    unique: true,
    effects: { storage: 200 },
    cost: { branch: 120, stone: 40 },
    lore: 'Первое место, где добро не пропадает под дождём.',
  },
  smithy: {
    id: 'smithy',
    name: 'Кузница',
    stageFrom: 2,
    unique: true,
    effects: { craftStations: ['smithy'] },
    cost: { branch: 150, stone: 100 },
    lore: 'Горн, наковальня и человек, который умеет с ними обращаться.',
  },
  herb_hut: {
    id: 'herb_hut',
    name: 'Дом травника',
    stageFrom: 2,
    unique: true,
    effects: { craftStations: ['herb_hut'] },
    cost: { branch: 90, stone: 30 },
    lore: 'Пучки трав под потолком, полки с банками и запах, от которого кружится голова.',
  },
};

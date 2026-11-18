/**
 * Локации деревни и окрестностей.
 *
 * map — положение точки на SVG-карте в процентах (0–100).
 * nodes — узлы сбора, actions — действия (обработчики в ui/village.js).
 */

export const LOCATIONS = {
  yard: {
    id: 'yard',
    name: 'Двор старосты',
    stageFrom: 1,
    map: { left: 30, top: 43 },
    description:
      'Утоптанная земля, поленница у стены, колодец с воротом. Отсюда видно всю деревню — ' +
      'и то, как мало от неё осталось.',
    actions: ['talk_elder', 'sleep'],
  },

  edge: {
    id: 'edge',
    name: 'Опушка',
    stageFrom: 1,
    map: { left: 20, top: 14 },
    description:
      'Край леса за частоколом. Здесь ещё растёт то, что можно есть и чем можно лечиться, — ' +
      'если успеть собрать до темноты.',
    nodes: [
      {
        id: 'edge_herbs',
        title: 'Пучки трав',
        resource: 'herb',
        amount: 5,
        seconds: 2.6,
        text: 'Полевые травы у самой кромки леса. Мирна сушит такие над очагом.',
      },
      {
        id: 'edge_berries',
        title: 'Ягодный куст',
        resource: 'berry',
        amount: 3,
        seconds: 2,
        text: 'Кислые лесные ягоды. Летом их хватает, зимой о них вспоминают с тоской.',
      },
      {
        id: 'edge_branches',
        title: 'Сухостой',
        resource: 'branch',
        amount: 4,
        seconds: 2.4,
        text: 'Сухие ветки для костра и мелкого ремонта. Добра в лесу много, рук мало.',
      },
    ],
  },

  meadow: {
    id: 'meadow',
    name: 'Луг',
    stageFrom: 1,
    map: { left: 84, top: 50 },
    description:
      'Луг за околицей. Трава по пояс, цветы, пчёлы. Здесь можно набрать ягод — ' +
      'если не бояться промочить ноги в росе.',
    nodes: [
      {
        id: 'meadow_berries',
        title: 'Земляничная поляна',
        resource: 'berry',
        amount: 4,
        seconds: 2,
        text: 'Мелкая лесная земляника. Её хватит и на горсть, и на вяленье.',
      },
    ],
  },

  creek: {
    id: 'creek',
    name: 'Ручей',
    stageFrom: 1,
    map: { left: 80, top: 80 },
    description:
      'Ручей за деревней. Вода холодная даже летом; по берегу ветер наносит сушняк.',
    nodes: [
      {
        id: 'creek_branches',
        title: 'Сушняк у воды',
        resource: 'branch',
        amount: 3,
        seconds: 2.2,
        text: 'Ветер и вода приносят к берегу сухие ветки. Хорошая добыча для костра.',
      },
      {
        id: 'creek_stones',
        title: 'Камни у брода',
        resource: 'stone',
        amount: 3,
        seconds: 2.3,
        text: 'Валуны, вымытые водой. Из таких выйдут фундамент, печь и первые настоящие стены.',
      },
    ],
  },

  palisade: {
    id: 'palisade',
    name: 'Частокол у ворот',
    stageFrom: 1,
    map: { left: 50, top: 74 },
    description:
      'Пролом у самых ворот. Брёвна сгнили, скобы выпали. Через эту дыру в деревню входят ' +
      'не только ветер и дождь.',
    actions: ['repair_palisade'],
  },

  campfire: {
    id: 'campfire',
    name: 'Костёр',
    stageFrom: 1,
    map: { left: 37, top: 69 },
    description:
      'Сердце деревни. Котёл на треноге, тлеющие угли, запах дыма. Здесь готовят то, ' +
      'что нельзя есть сырым.',
    actions: ['open_craft'],
  },

  herbalist: {
    id: 'herbalist',
    name: 'Дом травницы',
    stageFrom: 1,
    map: { left: 66, top: 56 },
    description:
      'Пучки трав под потолком, полки с банками, запах, от которого кружится голова. ' +
      'Мирна знает о травах больше, чем вся деревня вместе.',
    actions: ['talk_herbalist'],
  },

  gates: {
    id: 'gates',
    name: 'У ворот',
    stageFrom: 1,
    map: { left: 43, top: 88 },
    description:
      'Дорога, уходящая в лес. Здесь останавливаются те, кто ещё рискует ходить через эти места.',
    actions: ['open_trade'],
  },
};

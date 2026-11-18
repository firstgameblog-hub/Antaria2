/**
 * Квесты-истории. Каждый квест — письмо или разговор, а не пункт списка.
 * Шаги проверяются по счётчикам ресурсов или флагам сюжета.
 */

export const QUESTS = {
  chapter1_first_steps: {
    id: 'chapter1_first_steps',
    chapter: 1,
    title: 'Первые шаги',
    from: 'Радим, староста',
    to: 'Зар',
    short: 'Три дела на сегодня. Не как работа — как долг.',
    intro:
      'Сын, деревня не может ждать. Сделай сегодня три вещи: собери травы у опушки, ' +
      'помоги починить частокол у ворот и поговори с травницей. ' +
      'Не делай это как работу. Делай это как долг. Отец.',
    steps: [
      { id: 'gather_herbs', text: 'Собрать травы у опушки', counter: 'herb', target: 10 },
      { id: 'repair_palisade', text: 'Починить частокол у ворот', counter: 'palisade', target: 0.7 },
      { id: 'talk_herbalist', text: 'Поговорить с травницей', flag: 'met_herbalist' },
    ],
    rewards: { coin: 10, flag: 'chapter1_steps_started' },
  },

  chapter1_report: {
    id: 'chapter1_report',
    chapter: 1,
    title: 'Идти к отцу',
    from: 'Зар',
    to: 'Радим',
    short: 'Ты сделал то, о чём просил отец. Пора рассказать ему.',
    intro:
      'Травы собраны, частокол у ворот держится, разговор с Мирной состоялся. ' +
      'Пора вернуться во двор и рассказать старосте, как прошёл день.',
    steps: [
      { id: 'visit_yard', text: 'Зайти во двор старосты', flag: 'visited_yard_report' },
    ],
    hint: 'Поговорите с Радимом на дворе.',
    rewards: {},
  },

  chapter1_askold: {
    id: 'chapter1_askold',
    chapter: 1,
    title: 'Слово старосты',
    from: 'Радим',
    to: 'Зар',
    short: 'Отец просил зайти к Аскольду у ворот и взять у него заказ.',
    intro:
      'Староста сказал: у ворот стоит Аскольд, торговец-странник. ' +
      'У него есть дело для деревни — и для Зара.',
    steps: [
      {
        id: 'talk_askold',
        text: 'Поговорить с Аскольдом у ворот',
        flag: 'askold_briefed',
      },
    ],
    hint: 'Аскольд ждёт у ворот.',
    rewards: {},
  },

  chapter1_order: {
    id: 'chapter1_order',
    chapter: 1,
    title: 'Заказ из Лозичей',
    from: 'Аскольд',
    to: 'Зар',
    short: 'Три отвара и две порции вяленых ягод для покупателя из Лозичей.',
    intro:
      'Аскольд берёт товар для Лозичей: три отвара и две порции вяленых ягод. ' +
      'За работу он обещает тридцать серебра.',
    steps: [
      { id: 'potions', text: 'Принести 3 отвара', counter: 'potion', target: 3 },
      {
        id: 'berries',
        text: 'Принести 2 порции вяленых ягод',
        counter: 'dried_berries',
        target: 2,
      },
      {
        id: 'deliver',
        text: 'Отдать заказ Аскольду',
        flag: 'askold_order_done',
      },
    ],
    hint: 'Когда товар будет готов, вернитесь к Аскольду.',
    rewards: { coin: 30 },
  },
};

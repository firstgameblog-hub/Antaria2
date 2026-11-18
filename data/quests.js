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
};

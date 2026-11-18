/**
 * Торговцы. Для вертикального среза — один странник.
 *
 * buyMarkup / sellMarkup — множители к базовой цене ресурса.
 * stock — что есть у торговца на продажу (обновляется по сюжету позже).
 */

export const TRADERS = {
  askold: {
    id: 'askold',
    name: 'Аскольд',
    role: 'торговец-странник',
    intro:
      '«Товар есть, серебро есть, а времени мало. Смотри, выбирай — ' +
      'второй раз я сюда не скоро загляну».',
    buyMarkup: 1.5,
    sellMarkup: 0.6,
    stock: {
      potion: 2,
      dried_berries: 3,
    },
  },
};

export const TRADER = TRADERS.askold;

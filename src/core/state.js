/**
 * Центральное состояние игры и единственная точка его изменения.
 *
 * Правило: никто снаружи не мутирует store.state напрямую.
 * Все изменения идут через store.update(mutator) — тогда слушатели
 * узнают об изменении через событие "state:changed".
 */

import { bus } from './events.js';
import { LOCATIONS } from '../../data/locations.js';
import { TRADER } from '../../data/traders.js';

export const SAVE_VERSION = 2;

const START_HOUR = 8;

/** Узлы сбора: сколько доступно и в какой день обновлялись. */
function createNodes() {
  const nodes = {};

  for (const location of Object.values(LOCATIONS)) {
    for (const node of location.nodes ?? []) {
      nodes[node.id] = { charges: node.amount, day: 1 };
    }
  }

  return nodes;
}

/** @returns {object} состояние новой игры */
export function createInitialState() {
  return {
    version: SAVE_VERSION,
    stage: 1,
    population: 20,

    time: {
      day: 1,
      minutes: START_HOUR * 60,
      speed: 1,
      paused: false,
      uiPaused: false,
    },

    player: {
      name: 'Зар',
      strength: 2,
      agility: 2,
      trade: 3,
      trust: 0,
    },

    stats: {
      herbGathered: 0,
      coinsEarned: 0,
    },

    resources: {
      herb: 0,
      berry: 0,
      branch: 2,
      coin: 15,
      potion: 0,
      dried_berries: 0,
    },

    buildings: {
      elder_hut: 1,
      house: 8,
      palisade: 0.6,
      campfire: 1,
      field: 2,
    },

    nodes: createNodes(),
    crafting: [],

    trader: {
      stock: { ...TRADER.stock },
    },

    flags: {},

    chronicle: [
      {
        id: 'ch-1',
        day: 1,
        title: 'Деревня на грани',
        text:
          'Население: 20 душ. Ресурсы почти на нуле. Частокол разрушен на 40%. ' +
          'Поля заброшены. Настроение жителей отчаянное. ' +
          'Цель: удержать деревню от исчезновения.',
      },
    ],

    settings: {
      sound: false,
    },

    meta: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

class Store {
  constructor() {
    this.state = createInitialState();
  }

  /**
   * Изменить состояние.
   * Мутатор может вернуть false, чтобы отменить уведомление слушателей.
   */
  update(mutator) {
    const result = mutator(this.state);
    if (result === false) return;

    this.state.meta.updatedAt = Date.now();
    bus.emit('state:changed', this.state);
  }

  /** Заменить состояние целиком (загрузка сохранения, новая игра). */
  replace(state) {
    this.state = state;
    bus.emit('state:loaded', state);
    bus.emit('state:changed', state);
  }

  reset() {
    this.replace(createInitialState());
  }
}

export const store = new Store();

/** Добавить запись в летопись. */
export function addChronicleEntry(title, text, day = store.state.time.day) {
  store.update((state) => {
    state.chronicle.push({
      id: `ch-${day}-${state.chronicle.length + 1}`,
      day,
      title,
      text,
    });
  });
}

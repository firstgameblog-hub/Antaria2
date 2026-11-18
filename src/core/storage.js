/**
 * Сохранения: localStorage + экспорт/импорт файла.
 *
 * Формат: { app: "antaria", version, savedAt, state }
 * Сейв с первого дня, как требует план (этап 1.2).
 */

import { bus } from './events.js';
import { SAVE_VERSION, createInitialState, store } from './state.js';

const PREFIX = 'antaria.save.';
const APP_ID = 'antaria';

export const SLOTS = {
  auto: 'Автосохранение',
  manual: 'Ручное сохранение',
};

function readRaw(slot) {
  try {
    const raw = localStorage.getItem(PREFIX + slot);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('[storage] не удалось прочитать сохранение:', error);
    return null;
  }
}

/**
 * Дополнить сохранение недостающими полями и привести к текущей версии.
 * Позволяет открывать старые сейвы после добавления новых данных.
 */
function hydrate(saved) {
  const base = createInitialState();

  const state = {
    ...base,
    ...saved,
    time: { ...base.time, ...(saved.time || {}) },
    resources: { ...base.resources, ...(saved.resources || {}) },
    settings: { ...base.settings, ...(saved.settings || {}) },
    meta: { ...base.meta, ...(saved.meta || {}) },
  };

  state.version = SAVE_VERSION;
  state.buildings = normalizeBuildings(saved.buildings);
  state.chronicle = Array.isArray(saved.chronicle) ? saved.chronicle : base.chronicle;
  state.flags = saved.flags && typeof saved.flags === 'object' ? saved.flags : {};
  state.population = Number.isFinite(saved.population) ? saved.population : base.population;
  state.stage = Number.isFinite(saved.stage) ? saved.stage : base.stage;

  // Новые поля этапа 2. Старые сейвы получают значения по умолчанию.
  state.player = { ...base.player, ...(saved.player || {}) };
  state.stats = { ...base.stats, ...(saved.stats || {}) };
  state.nodes = { ...base.nodes, ...(saved.nodes || {}) };
  state.crafting = Array.isArray(saved.crafting) ? saved.crafting : [];
  state.construction = Array.isArray(saved.construction) ? saved.construction : [];

  const savedStock = saved.trader && saved.trader.stock ? saved.trader.stock : {};
  state.trader = { stock: { ...base.trader.stock, ...savedStock } };

  // Время интерфейсной паузы (книга, диалоги) не переживает перезагрузку.
  state.time.uiPaused = false;

  return state;
}

/**
 * Привести постройки к единому виду { level, count, integrity? }.
 * Сейвы версии 2 хранили часть построек числами.
 */
function normalizeBuildings(saved) {
  const base = createInitialState().buildings;
  const result = {};

  for (const [id, value] of Object.entries(base)) {
    result[id] = { ...value };
  }

  if (!saved || typeof saved !== 'object') return result;

  for (const [id, value] of Object.entries(saved)) {
    if (typeof value === 'number') {
      if (id === 'palisade') {
        result[id] = {
          ...(result[id] || { level: 1, count: 1 }),
          integrity: Math.min(1, Math.max(0, value)),
        };
      } else if (id === 'house' || id === 'field') {
        result[id] = {
          ...(result[id] || { level: 1, count: 0 }),
          level: 1,
          count: Math.max(0, Math.floor(value)),
        };
      } else {
        const level = value > 0 ? value : 0;
        result[id] = {
          ...(result[id] || { level: 0, count: 0 }),
          level,
          count: level > 0 ? 1 : 0,
        };
      }
      continue;
    }

    if (value && typeof value === 'object') {
      result[id] = { ...(result[id] || { level: 0, count: 0 }), ...value };
    }
  }

  return result;
}

/** Прочитать сохранение без применения. */
export function readSave(slot) {
  const payload = readRaw(slot);
  if (!payload || payload.app !== APP_ID || !payload.state) return null;
  return hydrate(payload.state);
}

/** Сохранить текущее состояние в слот. */
export function save(slot = 'manual') {
  try {
    const payload = {
      app: APP_ID,
      version: SAVE_VERSION,
      savedAt: Date.now(),
      state: store.state,
    };
    localStorage.setItem(PREFIX + slot, JSON.stringify(payload));
    bus.emit('save:done', { slot, savedAt: payload.savedAt });
    return true;
  } catch (error) {
    console.error('[storage] сохранение не удалось:', error);
    bus.emit('ui:toast', 'Не удалось сохранить: хранилище браузера недоступно.');
    return false;
  }
}

/** Загрузить сохранение в состояние игры. */
export function load(slot) {
  const state = readSave(slot);
  if (!state) {
    bus.emit('ui:toast', 'Сохранение не найдено или повреждено.');
    return false;
  }

  store.replace(state);
  bus.emit('save:loaded', { slot });
  return true;
}

/** Удалить слот. */
export function remove(slot) {
  try {
    localStorage.removeItem(PREFIX + slot);
    return true;
  } catch (error) {
    console.error('[storage] удаление не удалось:', error);
    return false;
  }
}

/** Состояние всех слотов для экрана сохранений. */
export function listSaves() {
  return Object.entries(SLOTS).map(([slot, label]) => {
    const payload = readRaw(slot);
    if (!payload || payload.app !== APP_ID || !payload.state) {
      return { slot, label, empty: true };
    }
    return {
      slot,
      label,
      empty: false,
      savedAt: payload.savedAt,
      day: payload.state.time?.day ?? 1,
      version: payload.version ?? 1,
    };
  });
}

/** Скачать сейв файлом. */
export function exportSave() {
  const state = store.state;
  const payload = {
    app: APP_ID,
    version: SAVE_VERSION,
    savedAt: Date.now(),
    state,
  };

  try {
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `antaria-day-${state.time.day}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    bus.emit('ui:toast', 'Сохранение выгружено в файл.');
    return true;
  } catch (error) {
    console.error('[storage] экспорт не удался:', error);
    bus.emit('ui:toast', 'Не удалось выгрузить сохранение.');
    return false;
  }
}

/** Загрузить сейв из файла. */
export async function importSave(file) {
  try {
    const text = await file.text();
    const payload = JSON.parse(text);

    if (!payload || payload.app !== APP_ID || !payload.state) {
      throw new Error('это не сохранение Хроник Антарии');
    }

    store.replace(hydrate(payload.state));
    bus.emit('save:loaded', { slot: 'file' });
    return true;
  } catch (error) {
    console.error('[storage] импорт не удался:', error);
    bus.emit('ui:toast', `Импорт не удался: ${error.message}`);
    return false;
  }
}

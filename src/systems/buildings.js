/** Стройка: уровни построек, очередь работ, эффекты деревни. */

import { BUILDINGS } from '../../data/buildings.js';
import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { addChronicleEntry, store } from '../core/state.js';
import { absoluteMinutes } from '../core/time.js';

const EFFECT_NAMES = {
  housing: 'жильё',
  storage: 'склад',
  defense: 'защита',
  comfort: 'уют',
  food: 'еда',
};

export function getBuildingRecord(id) {
  return store.state.buildings[id] ?? null;
}

/** Следующий уровень для постройки или null, если дальше некуда. */
export function getNextLevel(def) {
  const record = getBuildingRecord(def.id);
  if (!record || def.buildable === false) return null;

  if (def.unique) {
    return def.levels[record.level] ?? null;
  }

  return def.levels[0] ?? null;
}

export function maxWorkers() {
  return Math.max(1, Math.floor(store.state.population / 10));
}

export function workersBusy() {
  return store.state.construction.length;
}

export function isUnderConstruction(id) {
  return store.state.construction.some((job) => job.buildingId === id);
}

export function missingResources(cost = {}) {
  return Object.entries(cost).filter(
    ([id, need]) => (store.state.resources[id] ?? 0) < need,
  );
}

/** Можно ли начать стройку. */
export function canBuild(id) {
  const def = BUILDINGS[id];
  const record = getBuildingRecord(id);

  if (!def || !record) return { ok: false, reason: 'Неизвестная постройка.' };
  if (def.buildable === false) return { ok: false, reason: 'Не строится.' };

  if (def.stageFrom > store.state.stage) {
    return { ok: false, reason: `Откроется на стадии ${def.stageFrom}.` };
  }

  if (isUnderConstruction(id)) {
    return { ok: false, reason: 'Уже строится.' };
  }

  if (workersBusy() >= maxWorkers()) {
    return { ok: false, reason: 'Нет свободных рабочих.' };
  }

  const next = getNextLevel(def);
  if (!next) return { ok: false, reason: 'Максимальный уровень.' };

  const missing = missingResources(next.cost);
  if (missing.length) {
    return {
      ok: false,
      reason: `Не хватает: ${missing.map(([rid]) => RESOURCES[rid].name).join(', ')}.`,
    };
  }

  return { ok: true, next };
}

export function build(id) {
  const check = canBuild(id);
  if (!check.ok) {
    bus.emit('ui:toast', check.reason);
    return false;
  }

  const def = BUILDINGS[id];
  const record = getBuildingRecord(id);
  const next = check.next;
  const targetLevel = def.unique ? record.level + 1 : 1;

  store.update((state) => {
    for (const [rid, need] of Object.entries(next.cost)) {
      state.resources[rid] = (state.resources[rid] ?? 0) - need;
    }

    state.construction.push({
      id: `build-${Date.now()}-${state.construction.length}`,
      buildingId: id,
      level: targetLevel,
      endsAt: absoluteMinutes(state) + next.minutes,
    });
  });

  bus.emit('ui:toast', `Начато строительство: ${next.name}.`);
  return true;
}

/** Завершить готовые стройки. Вызывается на каждой игровой минуте. */
export function processConstruction() {
  const state = store.state;
  if (!state.construction.length) return;

  const now = absoluteMinutes(state);
  const finished = state.construction.filter((job) => job.endsAt <= now);
  if (!finished.length) return;

  const completed = [];

  store.update((current) => {
    for (const job of finished) {
      const def = BUILDINGS[job.buildingId];
      const record = current.buildings[job.buildingId];
      if (!def || !record) continue;

      if (def.unique) {
        record.level = Math.max(record.level, job.level);
        record.count = 1;
      } else {
        record.level = Math.max(1, record.level);
        record.count += 1;
      }

      completed.push({
        def,
        level: job.level,
        name: def.levels[job.level - 1]?.name ?? def.name,
      });
    }

    current.construction = current.construction.filter(
      (job) => !finished.some((done) => done.id === job.id),
    );
  });

  for (const item of completed) {
    bus.emit('ui:toast', `Готово: ${item.name}.`);

    if (item.def.unique) {
      const verb = item.level > 1 ? 'обновлено' : 'построено';
      addChronicleEntry(
        `Постройка: ${item.name}`,
        `В деревне ${verb}: ${item.name.toLowerCase()}.`,
      );
    }
  }
}

/** Суммарные эффекты всех построек. */
export function getVillageEffects() {
  const state = store.state;
  const totals = { housing: 0, storage: 0, defense: 0, comfort: 0, food: 0 };

  for (const def of Object.values(BUILDINGS)) {
    const record = state.buildings[def.id];
    if (!record || !record.level) continue;
    if (def.id === 'palisade') continue;

    const level = def.levels[record.level - 1];
    if (!level?.effects) continue;

    const multiplier = def.unique ? 1 : Math.max(1, record.count);

    for (const key of ['housing', 'storage', 'defense', 'comfort', 'food']) {
      totals[key] += (level.effects[key] ?? 0) * multiplier;
    }
  }

  totals.defense += Math.round((state.buildings.palisade?.integrity ?? 0) * 100);

  return totals;
}

/** "жильё +4, уют +1" */
export function formatEffects(effects = {}) {
  return Object.entries(EFFECT_NAMES)
    .filter(([key]) => effects[key])
    .map(([key, label]) => `${label} +${effects[key]}`)
    .join(', ');
}

/** Данные для карточки стройки. */
export function getBuildView(def) {
  const record = getBuildingRecord(def.id);
  const job = store.state.construction.find((item) => item.buildingId === def.id) ?? null;
  const next = getNextLevel(def);
  const check = canBuild(def.id);

  return {
    def,
    record,
    job,
    next,
    check,
    currentName:
      record.level > 0
        ? def.levels[record.level - 1]?.name ?? def.name
        : 'не построено',
  };
}

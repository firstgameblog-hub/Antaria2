/** Сюжетные переходы между поручениями: староста, Аскольд, заказ. */

import { bus } from '../core/events.js';
import { addChronicleEntry, store } from '../core/state.js';

export function acceptElderTask() {
  if (store.state.flags.elder_reported) return false;

  store.update((state) => {
    state.flags.elder_reported = true;
  });

  addChronicleEntry(
    'Разговор со старостой',
    'Зар рассказал Радиму о сделанном. Староста отправил его к Аскольду: ' +
      'у торговца есть заказ из Лозичей, а деревне нужны деньги.',
  );

  bus.emit('ui:toast', 'Новое поручение: поговорить с Аскольдом.');
  return true;
}

export function acceptAskoldOrder() {
  if (store.state.flags.askold_briefed) return false;

  store.update((state) => {
    state.flags.askold_briefed = true;
  });

  addChronicleEntry(
    'Заказ из Лозичей',
    'Аскольд дал заказ: три отвара и две порции вяленых ягод для покупателя ' +
      'из Лозичей. Плата — тридцать серебра.',
  );

  bus.emit('ui:toast', 'Взят заказ: 3 отвара и 2 порции ягод.');
  return true;
}

export const ELDER_TITHE = 15;

export function payElderTithe() {
  const state = store.state;

  if ((state.resources.coin ?? 0) < ELDER_TITHE) {
    return false;
  }

  store.update((current) => {
    current.resources.coin -= ELDER_TITHE;
    current.flags.elder_final_report = true;
    current.flags.visited_yard_final = true;
  });

  addChronicleEntry(
    'Общий котёл',
    'Староста взял пятнадцать серебра на семена, смолу и соль. ' +
      'Деревня будет жить дальше — и это только начало.',
  );

  bus.emit('ui:toast', 'Староста взял 15 серебра на общие нужды.');
  return true;
}

export function canReportStage2() {
  const state = store.state;

  return (
    state.stage === 2 &&
    (state.buildings.smithy?.level ?? 0) > 0 &&
    (state.buildings.barn?.level ?? 0) > 0 &&
    (state.buildings.elder_hut?.level ?? 0) >= 2 &&
    (state.buildings.watchtower?.level ?? 0) > 0 &&
    (state.buildings.campfire?.level ?? 0) >= 2 &&
    (state.buildings.herb_hut?.level ?? 0) > 0 &&
    (state.resources.knife ?? 0) >= 1 &&
    (state.resources.axe ?? 0) >= 1 &&
    (state.resources.meat ?? 0) >= 3 &&
    (state.resources.hide ?? 0) >= 1
  );
}

const STAGE2_MILESTONES = [
  {
    flag: 'chapter2_barn_done',
    building: 'barn',
    level: 1,
    title: 'Кладовая',
    text: 'Склад готов. Мясо и шкуры больше не гниют под дождём.',
  },
  {
    flag: 'chapter2_family_done',
    building: 'elder_hut',
    level: 2,
    title: 'Семья из Лозичей',
    text:
      'Семья из Лозичей перебралась в дом старосты. ' +
      'В деревне стало на четыре души больше.',
    population: 4,
  },
  {
    flag: 'chapter2_watch_done',
    building: 'watchtower',
    level: 1,
    title: 'Дозор',
    text: 'На вышке теперь есть дозорный. На тракте стало спокойнее.',
  },
  {
    flag: 'chapter2_hearth_done',
    building: 'campfire',
    level: 2,
    title: 'Тёплый очаг',
    text: 'Костёр укрыт навесом. У огня можно собраться даже в дождь.',
  },
  {
    flag: 'chapter2_herb_done',
    building: 'herb_hut',
    level: 1,
    title: 'Дом травника',
    text:
      'У Мирны теперь есть дом с полками и печью. В тепле трава отдаёт вдвое больше — ' +
      'в котле можно варить двойной отвар.',
  },
];

/** Награды за постройки второй стадии: семья, дозор, кладовая, очаг. */
export function checkStage2Milestones() {
  const state = store.state;
  if (state.stage < 2) return false;

  let changed = false;

  for (const milestone of STAGE2_MILESTONES) {
    if (state.flags[milestone.flag]) continue;
    if ((state.buildings[milestone.building]?.level ?? 0) < milestone.level) {
      continue;
    }

    store.update((current) => {
      current.flags[milestone.flag] = true;
      if (milestone.population) {
        current.population += milestone.population;
      }
    });

    addChronicleEntry(milestone.title, milestone.text);
    bus.emit('ui:toast', `${milestone.title}: готово.`);
    changed = true;
  }

  return changed;
}

export function finishStage2() {  if (store.state.flags.chapter2_reported) return false;

  store.update((state) => {
    state.flags.chapter2_reported = true;
    state.flags.visited_yard_stage2 = true;
    state.resources.coin += 20;
  });

  addChronicleEntry(
    'Кузница и припасы',
    'Кузница работает, инструмент есть, мясо и шкура добыты. ' +
      'Радим доволен: деревня оживает.',
  );

  bus.emit('ui:toast', 'Староста заплатил 20 серебра.');
  return true;
}

export function canDeliverAskoldOrder() {
  const state = store.state;
  return (
    (state.resources.potion ?? 0) >= 3 &&
    (state.resources.dried_berries ?? 0) >= 2
  );
}

export function deliverAskoldOrder() {
  if (!canDeliverAskoldOrder()) {
    bus.emit('ui:toast', 'Нужно 3 отвара и 2 порции вяленых ягод.');
    return false;
  }

  store.update((state) => {
    state.resources.potion -= 3;
    state.resources.dried_berries -= 2;
    state.resources.coin += 30;
    state.flags.askold_order_done = true;
  });

  addChronicleEntry(
    'Заказ из Лозичей выполнен',
    'Три отвара и две порции ягод ушли в Лозичи. Аскольд расплатился: ' +
      'деревня получила тридцать серебра.',
  );

  bus.emit('ui:toast', 'Заказ выполнен: +30 серебра.');
  return true;
}

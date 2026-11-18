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

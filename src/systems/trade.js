/** Торговля с Аскольдом: покупка из запаса, продажа из сумки. */

import { RESOURCES } from '../../data/resources.js';
import { TRADER } from '../../data/traders.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';

const roundPrice = (value) => Math.max(1, Math.round(value));

function tradeBonus() {
  return Math.max(0, store.state.player.trade - 3) * 0.03;
}

export function buyPrice(resourceId) {
  const base = RESOURCES[resourceId]?.price ?? 1;
  return roundPrice(base * TRADER.buyMarkup * (1 - tradeBonus()));
}

export function sellPrice(resourceId) {
  const base = RESOURCES[resourceId]?.price ?? 1;
  return roundPrice(base * TRADER.sellMarkup * (1 + tradeBonus()));
}

export function stockOf(resourceId) {
  return store.state.trader.stock[resourceId] ?? 0;
}

export function buy(resourceId) {
  const state = store.state;
  const price = buyPrice(resourceId);

  if (stockOf(resourceId) <= 0) {
    bus.emit('ui:toast', 'У Аскольда это кончилось.');
    return false;
  }

  if (state.resources.coin < price) {
    bus.emit('ui:toast', 'Не хватает серебра.');
    return false;
  }

  store.update((current) => {
    current.resources.coin -= price;
    current.resources[resourceId] = (current.resources[resourceId] ?? 0) + 1;
    current.trader.stock[resourceId] -= 1;
  });

  bus.emit('ui:toast', `Куплено: ${RESOURCES[resourceId].name} за ${price}.`);
  return true;
}

export function sell(resourceId) {
  const state = store.state;

  if ((state.resources[resourceId] ?? 0) <= 0) return false;

  const price = sellPrice(resourceId);

  store.update((current) => {
    current.resources[resourceId] -= 1;
    current.resources.coin += price;
    current.stats.coinsEarned += price;
  });

  bus.emit('ui:toast', `Продано: ${RESOURCES[resourceId].name} за ${price}.`);
  return true;
}

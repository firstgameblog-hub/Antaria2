/** Экран торговли: покупка из запаса Аскольда и продажа из сумки. */

import { RESOURCES } from '../../data/resources.js';
import { TRADER } from '../../data/traders.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { buy, buyPrice, sell, sellPrice, stockOf } from '../systems/trade.js';
import { el } from './dom.js';

function renderBuy(state) {
  const host = document.querySelector('[data-trade-buy]');

  host.replaceChildren(
    ...Object.keys(TRADER.stock).map((id) => {
      const resource = RESOURCES[id];
      const stock = stockOf(id);
      const price = buyPrice(id);

      const row = el('li', 'trade-row');
      row.append(el('span', 'trade-name', resource.name));
      row.append(el('span', 'trade-stock', `в запасе: ${stock}`));
      row.append(el('span', 'trade-price', `${price} сер.`));

      const button = el('button', 'btn btn-small', 'Купить');
      button.type = 'button';
      button.disabled = stock <= 0 || (state.resources.coin ?? 0) < price;
      button.addEventListener('click', () => buy(id));
      row.append(button);

      return row;
    }),
  );
}

function renderSell(state) {
  const host = document.querySelector('[data-trade-sell]');

  const sellable = Object.values(RESOURCES).filter(
    (resource) =>
      resource.kind !== 'currency' && (state.resources[resource.id] ?? 0) > 0,
  );

  if (!sellable.length) {
    host.replaceChildren(
      el('li', 'muted', 'Пока нечего продать. Соберите травы, ягоды или ветки.'),
    );
    return;
  }

  host.replaceChildren(
    ...sellable.map((resource) => {
      const row = el('li', 'trade-row');

      row.append(
        el(
          'span',
          'trade-name',
          `${resource.name} (${state.resources[resource.id]})`,
        ),
      );
      row.append(el('span', 'trade-price', `${sellPrice(resource.id)} сер.`));

      const button = el('button', 'btn btn-small', 'Продать');
      button.type = 'button';
      button.addEventListener('click', () => sell(resource.id));
      row.append(button);

      return row;
    }),
  );
}

function render() {
  const state = store.state;

  document.querySelector('[data-trade-coin]').textContent = String(state.resources.coin ?? 0);
  document.querySelector('[data-trade-skill]').textContent = String(state.player.trade);

  renderBuy(state);
  renderSell(state);
}

export function initTrade() {
  document.querySelector('[data-trader-intro]').textContent = TRADER.intro;

  bus.on('state:changed', render);
  render();
}

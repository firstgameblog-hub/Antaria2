/** Инвентарь: ячейки предметов и черновые характеристики героя. */

import { RESOURCES } from '../../data/resources.js';
import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { el } from './dom.js';

const KIND_LABEL = {
  plant: 'растение',
  wood: 'дерево',
  mineral: 'камень',
  product: 'товар',
  material: 'материал',
  currency: 'серебро',
};

function renderItems() {
  const grid = document.querySelector('[data-inventory]');
  const state = store.state;

  const items = Object.values(RESOURCES)
    .filter((resource) => Math.min(...resource.stages) <= state.stage)
    .filter(
      (resource) =>
        resource.kind === 'currency' || (state.resources[resource.id] ?? 0) > 0,
    )
    .sort((a, b) => {
      if (a.kind === 'currency') return -1;
      if (b.kind === 'currency') return 1;
      return a.name.localeCompare(b.name, 'ru');
    });

  if (!items.length) {
    grid.replaceChildren(el('p', 'muted', 'Сумка пуста. Придёт время — наполнится.'));
    return;
  }

  grid.replaceChildren(
    ...items.map((resource) => {
      const coin = resource.kind === 'currency';
      const card = el('div', `item-card${coin ? ' is-coin' : ''}`);

      card.append(el('span', 'item-name', resource.name));
      card.append(el('span', 'item-qty', String(state.resources[resource.id] ?? 0)));
      card.append(
        el(
          'span',
          'item-meta',
          coin ? 'валюта' : `${KIND_LABEL[resource.kind] ?? resource.kind} · цена ~${resource.price}`,
        ),
      );

      return card;
    }),
  );
}

function renderStats() {
  const host = document.querySelector('[data-player-stats]');
  const { player } = store.state;

  const rows = [
    ['Сила', player.strength],
    ['Ловкость', player.agility],
    ['Торговое чутьё', player.trade],
    ['Доверие', player.trust],
  ];

  host.replaceChildren(
    ...rows.map(([label, value]) => {
      const block = el('div', 'stat');
      block.append(el('dt', '', label));
      block.append(el('dd', '', String(value)));
      return block;
    }),
  );
}

function render() {
  renderItems();
  renderStats();
}

export function initInventory() {
  bus.on('state:changed', render);
  render();
}

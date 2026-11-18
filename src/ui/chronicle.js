/** Экран «Хроника»: летопись деревни, новые записи сверху. */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';

export function initChronicle() {
  const list = document.querySelector('[data-chronicle]');
  if (!list) return;

  function render() {
    const entries = [...store.state.chronicle].reverse();

    const nodes = entries.map((entry) => {
      const item = document.createElement('li');
      item.className = 'chronicle-entry';

      const day = document.createElement('span');
      day.className = 'chronicle-day';
      day.textContent = `День ${entry.day}`;

      const title = document.createElement('h3');
      title.textContent = entry.title;

      const text = document.createElement('p');
      text.textContent = entry.text;

      item.append(day, title, text);
      return item;
    });

    list.replaceChildren(...nodes);
  }

  render();
  bus.on('state:changed', render);
}

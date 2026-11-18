/**
 * Сцена деревни: SVG-вид текущей стадии.
 * Один вид на стадию — svg/stage-N/village.svg (см. docs/village_stages.md).
 */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';

export async function initScene() {
  const host = document.querySelector('[data-scene]');
  if (!host) return;

  let token = 0;
  let currentStage = null;

  async function render(stage) {
    if (stage === currentStage) return;
    currentStage = stage;

    const request = ++token;
    host.dataset.stage = String(stage);

    try {
      const response = await fetch(`svg/stage-${stage}/map.svg`, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const markup = await response.text();
      if (request !== token) return;

      host.innerHTML = markup;
    } catch (error) {
      if (request !== token) return;

      console.warn('[scene] карта деревни не загрузилась:', error);

      const fallback = document.createElement('p');
      fallback.className = 'scene-fallback';
      fallback.textContent =
        'Карта деревни не загрузилась. Откройте игру через локальный сервер: node tools/serve.mjs';

      host.replaceChildren(fallback);
    }
  }

  await render(store.state.stage);
  syncPalisade();

  bus.on('state:changed', () => {
    syncPalisade();
    render(store.state.stage);
  });
}

/** Пролом на карте закрывается, когда частокол отремонтирован хотя бы до 70%. */
function syncPalisade() {
  const host = document.querySelector('[data-scene]');
  if (!host) return;

  const integrity = store.state.buildings.palisade ?? 0;
  host.dataset.palisade = integrity >= 0.7 ? 'repaired' : 'broken';
}

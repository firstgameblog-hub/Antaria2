/**
 * Верхняя панель: часы, день, стадия, население, частокол, припасы.
 * Перерисовывается только когда меняются данные — не каждый кадр.
 */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { formatClock, formatDay } from '../core/time.js';
import { RESOURCES } from '../../data/resources.js';
import { STAGES } from '../../data/stages.js';

export function initHud() {
  const refs = {
    clock: document.querySelector('[data-hud="clock"]'),
    day: document.querySelector('[data-hud="day"]'),
    population: document.querySelector('[data-hud="population"]'),
    palisade: document.querySelector('[data-hud="palisade"]'),
    resources: document.querySelector('[data-hud="resources"]'),
    stageNumber: document.querySelector('[data-hud="stage-number"]'),
    stageName: document.querySelector('[data-hud="stage-name"]'),
    chapterNumber: document.querySelector('[data-hud="chapter-number"]'),
    chapterName: document.querySelector('[data-hud="chapter-name"]'),
    pause: document.getElementById('btn-pause'),
  };

  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

  let lastClock = '';
  let lastDay = 0;
  let lastPaused = null;
  let resourceSignature = '';
  const resourceNodes = new Map();

  function renderTime() {
    const time = store.state.time;
    const clock = formatClock(time.minutes);

    if (clock !== lastClock) {
      refs.clock.textContent = clock;
      lastClock = clock;
    }

    if (time.day !== lastDay) {
      refs.day.textContent = formatDay(time.day);
      lastDay = time.day;
    }

    if (refs.pause && time.paused !== lastPaused) {
      refs.pause.textContent = time.paused ? 'Продолжить' : 'Пауза';
      refs.pause.setAttribute('aria-pressed', String(time.paused));
      lastPaused = time.paused;
    }
  }

  function renderResources(state) {
    const visible = Object.values(RESOURCES).filter(
      (resource) => Math.min(...resource.stages) <= state.stage,
    );
    const signature = visible.map((resource) => resource.id).join('|');

    if (signature !== resourceSignature) {
      resourceSignature = signature;
      resourceNodes.clear();

      const fragment = document.createDocumentFragment();

      for (const resource of visible) {
        const item = document.createElement('li');

        const name = document.createElement('span');
        name.className = 'res-name';
        name.textContent = resource.name;

        const quantity = document.createElement('span');
        quantity.className = 'res-qty';
        quantity.textContent = '0';

        item.append(name, quantity);
        fragment.append(item);

        resourceNodes.set(resource.id, quantity);
      }

      refs.resources.replaceChildren(fragment);
    }

    for (const [id, node] of resourceNodes) {
      node.textContent = String(state.resources[id] ?? 0);
    }
  }

  function renderState() {
    const state = store.state;
    const stage = STAGES[state.stage];

    refs.stageNumber.textContent = String(state.stage);
    refs.stageName.textContent = stage ? stage.name : '—';

    if (stage) {
      refs.chapterNumber.textContent = ROMAN[stage.id] ?? String(stage.id);
      refs.chapterName.textContent = stage.chapter;
    }
    refs.population.textContent = String(state.population);

    const integrity = Number(state.buildings.palisade) || 0;
    refs.palisade.textContent = `${Math.round(integrity * 100)}%`;

    renderResources(state);
  }

  bus.on('time:tick', renderTime);
  bus.on('state:changed', () => {
    renderTime();
    renderState();
  });

  renderTime();
  renderState();
}

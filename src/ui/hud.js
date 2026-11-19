/**
 * Верхняя панель: часы, день, стадия, население, частокол.
 * Перерисовывается только когда меняются данные — не каждый кадр.
 */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { formatClock, formatDay } from '../core/time.js';
import { STAGES } from '../../data/stages.js';

export function initHud() {
  const refs = {
    clock: document.querySelector('[data-hud="clock"]'),
    day: document.querySelector('[data-hud="day"]'),
    population: document.querySelector('[data-hud="population"]'),
    palisade: document.querySelector('[data-hud="palisade"]'),
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

    const integrity = Number(state.buildings.palisade?.integrity) || 0;
    refs.palisade.textContent = `${Math.round(integrity * 100)}%`;
  }

  bus.on('time:tick', renderTime);
  bus.on('state:changed', () => {
    renderTime();
    renderState();
  });

  renderTime();
  renderState();
}

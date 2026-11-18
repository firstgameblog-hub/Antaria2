/**
 * Игровой цикл на requestAnimationFrame.
 *
 * За кадр продвигает время и сообщает об этом событиями:
 *   time:tick   — каждый кадр (для часов)
 *   time:minute — сменилась игровая минута
 *   time:day    — наступил новый день
 */

import { bus } from './events.js';
import { store } from './state.js';
import { advanceTime } from './time.js';

/** Ограничение шага: после сворачивания вкладки не прожигаем недели за кадр. */
const MAX_DELTA_SECONDS = 1;

export function startLoop() {
  let lastFrame = performance.now();
  let rafId = 0;

  function frame(now) {
    const delta = Math.min((now - lastFrame) / 1000, MAX_DELTA_SECONDS);
    lastFrame = now;

    const state = store.state;
    const { dayChanged, minuteChanged } = advanceTime(state, delta);

    if (minuteChanged) bus.emit('time:minute', state.time);
    if (dayChanged) bus.emit('time:day', state.time.day);

    bus.emit('time:tick', state.time);

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(rafId);
}

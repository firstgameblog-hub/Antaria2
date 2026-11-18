/**
 * Пауза времени для «читающих» экранов: книга, диалоги.
 * Счётчик нужен, чтобы закрытие одного окна не снимало паузу другого.
 */

import { store } from '../core/state.js';

let locks = 0;

export function lockTime() {
  locks += 1;

  // Ставим паузу при каждой блокировке: состояние могли заменить сбросом
  // или загрузкой, пока счётчик уже был больше нуля.
  store.update((state) => {
    state.time.uiPaused = true;
  });
}

export function unlockTime() {
  locks = Math.max(0, locks - 1);

  if (locks === 0) {
    store.update((state) => {
      state.time.uiPaused = false;
    });
  }
}

export function isTimeLocked() {
  return locks > 0;
}

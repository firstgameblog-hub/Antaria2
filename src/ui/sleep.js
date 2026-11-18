/**
 * Сцена сна: экран затемняется, день сменяется, затем возвращается свет.
 * Дольше сбора ресурсов (5 секунд) — это переход между днями, а не действие.
 */

import { store } from '../core/state.js';
import { advanceToMorning } from '../systems/village.js';
import { lockTime, unlockTime } from './overlay.js';
import { toast } from './toast.js';

const NIGHT_MS = 2300;
const FADE_OUT_MS = 4300;
const TOTAL_MS = 5000;

let active = false;
let timers = [];

function setText(root, selector, text) {
  const node = root.querySelector(selector);
  if (node) node.textContent = text;
}

export function startSleep() {
  if (active) return false;

  const root = document.querySelector('[data-overlay="sleep"]');
  if (!root) return false;

  active = true;

  const fromDay = store.state.time.day;

  setText(root, '[data-sleep-kicker]', 'Ночь');
  setText(root, '[data-sleep-title]', `День ${fromDay} уходит`);
  setText(
    root,
    '[data-sleep-text]',
    'Деревня засыпает. Слышно, как ветер ходит по крышам.',
  );

  root.hidden = false;
  root.classList.remove('is-morning');
  document.body.classList.add('is-modal');

  lockTime();

  // Принудительный reflow, чтобы сработал переход opacity.
  void root.offsetWidth;
  root.classList.add('is-active');

  timers.push(
    window.setTimeout(() => {
      advanceToMorning();

      root.classList.add('is-morning');
      setText(root, '[data-sleep-kicker]', 'Утро');
      setText(root, '[data-sleep-title]', `День ${store.state.time.day}`);
      setText(
        root,
        '[data-sleep-text]',
        'Над частоколом поднимается свет. Травы и ветки снова можно собрать.',
      );
    }, NIGHT_MS),
  );

  timers.push(
    window.setTimeout(() => {
      root.classList.remove('is-active');
    }, FADE_OUT_MS),
  );

  timers.push(
    window.setTimeout(() => {
      root.hidden = true;
      document.body.classList.remove('is-modal');

      unlockTime();

      active = false;
      timers = [];

      toast('Наступило утро. Узлы сбора обновились.');
    }, TOTAL_MS),
  );

  return true;
}

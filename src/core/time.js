/**
 * Игровое время.
 *
 * Один игровой день длится REAL_SECONDS_PER_DAY реальных секунд при скорости ×1.
 * Время хранится парой "день + минуты внутри дня", чтобы сохранение оставалось
 * читаемым и не зависело от длительности сессии.
 */

export const MINUTES_PER_DAY = 24 * 60;

/** Цель из docs/game_loop.md: день ≈ 5 минут активной игры. */
export const REAL_SECONDS_PER_DAY = 300;

export const GAME_MINUTES_PER_SECOND = MINUTES_PER_DAY / REAL_SECONDS_PER_DAY;

/**
 * Продвинуть время.
 * @param {object} state состояние игры
 * @param {number} realSeconds прошедшие реальные секунды
 * @returns {{ dayChanged: boolean, minuteChanged: boolean }}
 */
export function advanceTime(state, realSeconds) {
  const time = state.time;

  if (time.paused || time.uiPaused || realSeconds <= 0) {
    return { dayChanged: false, minuteChanged: false };
  }

  const previousDay = time.day;
  const previousMinute = Math.floor(time.minutes);

  let minutes = time.minutes + realSeconds * GAME_MINUTES_PER_SECOND * time.speed;

  while (minutes >= MINUTES_PER_DAY) {
    minutes -= MINUTES_PER_DAY;
    time.day += 1;
  }

  time.minutes = minutes;

  return {
    dayChanged: time.day !== previousDay,
    minuteChanged: Math.floor(time.minutes) !== previousMinute,
  };
}

/** "08:05" */
export function formatClock(minutes) {
  const total = Math.floor(minutes) % MINUTES_PER_DAY;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/** "День 3" */
export function formatDay(day) {
  return `День ${day}`;
}

/** Абсолютное игровое время в минутах от начала игры — удобно для очередей. */
export function absoluteMinutes(state) {
  return (state.time.day - 1) * MINUTES_PER_DAY + state.time.minutes;
}

/** "18 мин", "1 ч 05 мин" */
export function formatDuration(minutes) {
  const total = Math.max(0, Math.ceil(minutes));

  if (total < 60) return `${total} мин`;

  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${hours} ч ${String(mins).padStart(2, '0')} мин`;
}

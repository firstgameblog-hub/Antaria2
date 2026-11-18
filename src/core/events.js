/**
 * Шина событий: простая публикация/подписка между модулями.
 * Модули не знают друг о друге — только о событиях.
 */

export class EventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }

  /**
   * Подписаться на событие.
   * @returns {() => void} функция отписки
   */
  on(type, handler) {
    if (!this._listeners.has(type)) {
      this._listeners.set(type, new Set());
    }
    this._listeners.get(type).add(handler);
    return () => this.off(type, handler);
  }

  once(type, handler) {
    const off = this.on(type, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(type, handler) {
    this._listeners.get(type)?.delete(handler);
  }

  emit(type, payload) {
    const handlers = this._listeners.get(type);
    if (!handlers) return;

    for (const handler of [...handlers]) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[bus] обработчик события "${type}" упал:`, error);
      }
    }
  }
}

export const bus = new EventBus();

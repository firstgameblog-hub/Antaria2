/**
 * Процедурный звук на WebAudio, без файлов.
 *
 * Пока это проверка работоспособности подхода (этап 1.1):
 * ветер как отфильтрованный шум + короткий щелчок интерфейса.
 * Браузер включает звук только после действия пользователя,
 * поэтому setEnabled вызывается по клику.
 */

class AudioEngine {
  constructor() {
    /** @type {AudioContext | null} */
    this.ctx = null;
    this.master = null;
    this.ambient = null;
    this.enabled = false;
  }

  _createContext() {
    if (this.ctx) return this.ctx;

    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      console.warn('[audio] WebAudio не поддерживается браузером.');
      return null;
    }

    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  async setEnabled(on) {
    this.enabled = on;

    if (!on) {
      if (this.ctx && this.ctx.state === 'running') {
        try {
          await this.ctx.suspend();
        } catch (error) {
          console.warn('[audio] не удалось приостановить звук:', error);
        }
      }
      return;
    }

    const ctx = this._createContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (error) {
        console.warn('[audio] браузер не дал запустить звук:', error);
      }
    }

    if (!this.ambient) {
      this._buildAmbient(ctx);
    }
  }

  /** Вернуть звук после жеста пользователя, если он включён в настройках. */
  async resume() {
    if (!this.enabled) return;

    const ctx = this._createContext();
    if (!ctx) return;

    if (!this.ambient) {
      this._buildAmbient(ctx);
    }

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        /* браузер всё ещё не разрешает — попробуем при следующем клике */
      }
    }
  }

  _buildAmbient(ctx) {
    const seconds = 2;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * 0.35;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    filter.Q.value = 0.6;

    const gain = ctx.createGain();
    gain.gain.value = 0.05;

    // Медленные порывы ветра.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);

    noise.start();
    lfo.start();

    this.ambient = { noise, filter, gain, lfo };
  }

  /** Щелчок интерфейса. */
  click() {
    if (!this.enabled || !this.ctx || this.ctx.state !== 'running') return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(760, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.14);
  }
}

export const audio = new AudioEngine();

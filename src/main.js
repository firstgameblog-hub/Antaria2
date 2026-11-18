/**
 * Точка входа: собирает модули, поднимает цикл и связывает интерфейс с состоянием.
 */

import { bus } from './core/events.js';
import { store } from './core/state.js';
import { startLoop } from './core/loop.js';
import {
  exportSave,
  importSave,
  listSaves,
  load,
  readSave,
  remove,
  save,
} from './core/storage.js';
import { audio } from './audio/audio.js';
import { initHud } from './ui/hud.js';
import { initChronicle } from './ui/chronicle.js';
import { initPanels, openTab } from './ui/panels.js';
import { initScene } from './ui/scene.js';
import { initVillage } from './ui/village.js';
import { initStage } from './ui/stage.js';
import { initInventory } from './ui/inventory.js';
import { initCraft } from './ui/craft.js';
import { initBuildings } from './ui/buildings.js';
import { initTrade } from './ui/trade.js';
import { initBook, openBook } from './ui/book.js';
import { initDialogue } from './ui/dialogue.js';
import { toast } from './ui/toast.js';
import { processCrafting } from './systems/crafting.js';
import { processConstruction } from './systems/buildings.js';
import { checkChapterQuest } from './systems/quests.js';
import { validateData } from '../data/index.js';

/** Продолжить с автосохранения, если оно есть. */
function restoreAutoSave() {
  const state = readSave('auto');
  if (!state) return null;

  store.replace(state);
  return state.time?.day ?? 1;
}

function initHeader() {
  const soundButton = document.getElementById('btn-sound');
  const pauseButton = document.getElementById('btn-pause');
  const speedSelect = document.getElementById('select-speed');

  function renderControls() {
    const state = store.state;

    soundButton.textContent = state.settings.sound ? 'Звук: вкл' : 'Звук: выкл';
    soundButton.setAttribute('aria-pressed', String(state.settings.sound));

    const speed = String(state.time.speed);
    if (speedSelect.value !== speed) speedSelect.value = speed;
  }

  soundButton.addEventListener('click', async () => {
    const enabled = !store.state.settings.sound;

    // Сначала отражаем намерение в интерфейсе, потом запускаем движок:
    // создание AudioContext не должно задерживать отклик кнопки.
    store.update((state) => {
      state.settings.sound = enabled;
    });

    await audio.setEnabled(enabled);

    if (enabled) audio.click();
  });

  pauseButton.addEventListener('click', () => {
    store.update((state) => {
      state.time.paused = !state.time.paused;
    });
    audio.click();
  });

  speedSelect.addEventListener('change', () => {
    const speed = Number(speedSelect.value) || 1;
    store.update((state) => {
      state.time.speed = speed;
    });
    audio.click();
  });

  // Браузер разрешает звук только после жеста. Если в сейве звук был включён,
  // возвращаем его при первом касании страницы.
  document.addEventListener(
    'pointerdown',
    () => {
      if (store.state.settings.sound) audio.resume();
    },
    { passive: true },
  );

  bus.on('state:changed', renderControls);
  bus.on('state:loaded', () => {
    audio.setEnabled(Boolean(store.state.settings.sound));
  });
  renderControls();

  if (store.state.settings.sound) {
    audio.setEnabled(true);
  }
}

function initSaves() {
  const list = document.querySelector('[data-save-list]');
  const importInput = document.getElementById('import-input');

  const formatSavedAt = (value) =>
    new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  function renderSaves() {
    const nodes = listSaves().map((entry) => {
      const item = document.createElement('li');
      item.className = 'save-slot';

      const text = document.createElement('div');

      const title = document.createElement('strong');
      title.textContent = entry.label;

      const subtitle = document.createElement('span');
      if (entry.empty) {
        subtitle.textContent = 'пусто';
        subtitle.className = 'save-empty';
      } else {
        subtitle.textContent = `${entry.day}-й день · ${formatSavedAt(entry.savedAt)}`;
      }

      text.append(title, subtitle);
      item.append(text);
      return item;
    });

    list.replaceChildren(...nodes);
  }

  document.getElementById('save-manual').addEventListener('click', () => {
    if (save('manual')) toast('Сохранено.');
  });

  document.getElementById('load-manual').addEventListener('click', () => {
    if (load('manual')) toast('Сохранение загружено.');
  });

  document.getElementById('delete-manual').addEventListener('click', () => {
    remove('manual');
    renderSaves();
    toast('Ручное сохранение удалено.');
  });

  document.getElementById('export-save').addEventListener('click', exportSave);

  document.getElementById('import-save').addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;

    if (await importSave(file)) {
      toast('Сохранение загружено из файла.');
    }

    importInput.value = '';
  });

  document.getElementById('reset-game').addEventListener('click', () => {
    const confirmed = window.confirm(
      'Начать заново? Несохранённый прогресс будет потерян.',
    );
    if (!confirmed) return;

    remove('auto');
    store.reset();
    save('auto');
    renderSaves();
    toast('Новая игра.');

    openTab('village');
    if (!store.state.flags.chapter1_intro_done) openBook();
  });

  renderSaves();
  bus.on('save:done', renderSaves);
  bus.on('save:loaded', renderSaves);
}

function initLoopHooks() {
  // Автосохранение на смене дня.
  bus.on('time:day', () => {
    save('auto');
  });

  // Крафт завершается по игровым минутам.
  bus.on('time:minute', processCrafting);
  bus.on('time:minute', processConstruction);

  // Страховка при закрытии вкладки.
  window.addEventListener('beforeunload', () => {
    save('auto');
  });
}

function boot() {
  bus.on('ui:toast', toast);

  const problems = validateData();
  if (problems.length) {
    console.warn(`[data] найдены проблемы:\n- ${problems.join('\n- ')}`);
  }

  const resumedDay = restoreAutoSave();

  initHud();
  initPanels();
  initChronicle();
  initScene();
  initVillage();
  initStage();
  initInventory();
  initCraft();
  initBuildings();
  initTrade();
  initBook();
  initDialogue();
  initHeader();
  initSaves();
  initLoopHooks();

  // Догоняем крафт и стройку, которые могли завершиться до загрузки страницы.
  processCrafting();
  processConstruction();
  checkChapterQuest();

  startLoop();

  if (!store.state.flags.chapter1_intro_done) {
    openBook();
  } else if (resumedDay) {
    toast(`Продолжаем с дня ${resumedDay}.`);
  }
}

boot();

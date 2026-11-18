/** Переключение разделов. openTab позволяет другим модулям вести игрока в нужный экран. */

let activatePanel = () => {};

export function initPanels() {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = [...document.querySelectorAll('[data-panel]')];

  function activate(name) {
    for (const tab of tabs) {
      const active = tab.dataset.tab === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    }

    for (const panel of panels) {
      panel.classList.toggle('is-active', panel.dataset.panel === name);
    }
  }

  for (const tab of tabs) {
    tab.addEventListener('click', () => activate(tab.dataset.tab));
  }

  activatePanel = activate;
  activate('village');
}

export function openTab(name) {
  activatePanel(name);
}

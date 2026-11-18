/** Всплывающие сообщения внизу экрана. */

export function toast(text) {
  const host = document.getElementById('toasts');
  if (!host) return;

  const element = document.createElement('div');
  element.className = 'toast';
  element.textContent = text;
  host.append(element);

  window.setTimeout(() => {
    element.classList.add('is-out');
    window.setTimeout(() => element.remove(), 320);
  }, 3200);
}

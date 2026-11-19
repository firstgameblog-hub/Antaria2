/** Диалоги: травница, староста и торговец. Один общий движок реплик. */

import { bus } from '../core/events.js';
import { store } from '../core/state.js';
import { checkChapterQuest } from '../systems/quests.js';
import {
  ELDER_TITHE,
  acceptAskoldOrder,
  acceptElderTask,
  canDeliverAskoldOrder,
  finishStage2,
  deliverAskoldOrder,
  payElderTithe,
} from '../systems/story.js';
import { el } from './dom.js';
import { lockTime, unlockTime } from './overlay.js';
import { openTab } from './panels.js';

let isOpen = false;
let current = null;
let onClose = null;

function rootNode() {
  return document.querySelector('[data-overlay="dialogue"]');
}

function bodyNode() {
  return document.querySelector('[data-dialogue-body]');
}

function footNode() {
  return document.querySelector('[data-dialogue-foot]');
}

export function openDialogue(dialogue) {
  if (isOpen) return;

  isOpen = true;
  current = dialogue;
  onClose = dialogue.onClose ?? null;

  document.querySelector('[data-dialogue-speaker]').textContent = dialogue.speaker;
  document.querySelector('[data-dialogue-role]').textContent = dialogue.role ?? '';

  const root = rootNode();
  root.hidden = false;
  document.body.classList.add('is-modal');
  lockTime();

  renderNode(dialogue.start ?? 'start');
}

function renderNode(id) {
  const node = current?.nodes?.[id];
  if (!node) {
    closeDialogue();
    return;
  }

  const body = bodyNode();
  body.replaceChildren();

  for (const line of node.text ?? []) {
    body.append(el('p', '', line));
  }

  const foot = footNode();
  foot.replaceChildren();

  for (const choice of node.choices ?? []) {
    const button = el('button', 'choice-btn', choice.label);
    button.type = 'button';
    button.addEventListener('click', () => choose(choice));
    foot.append(button);
  }
}

function choose(choice) {
  if (choice.effect) choice.effect();
  if (!isOpen) return;

  if (choice.close) {
    closeDialogue();
    return;
  }

  const next = typeof choice.next === 'function' ? choice.next() : choice.next;

  if (next) {
    renderNode(next);
    return;
  }

  closeDialogue();
}

function closeDialogue() {
  if (!isOpen) return;

  const callback = onClose;

  isOpen = false;
  current = null;
  onClose = null;

  rootNode().hidden = true;
  document.body.classList.remove('is-modal');
  unlockTime();

  if (callback) callback();
}

function giveHerbalistGift() {
  if (store.state.flags.herbalist_gift) return;

  store.update((state) => {
    state.flags.herbalist_gift = true;
    state.resources.potion += 1;
  });

  bus.emit('ui:toast', 'Мирна дала тебе отвар.');
}

function finishHerbalistTalk() {
  if (store.state.flags.met_herbalist) return;

  store.update((state) => {
    state.flags.met_herbalist = true;
  });

  checkChapterQuest();
  bus.emit('ui:toast', 'Мирна запомнит этот разговор.');
}

export function openHerbalist() {
  openDialogue({
    speaker: 'Мирна',
    role: 'травница',
    start: 'start',
    nodes: {
      start: {
        text: [
          '— Зашёл всё-таки. Садись, коли пришёл.',
          'Она не отрывается от пучка трав, но голос не злой — усталый.',
        ],
        choices: [
          { label: '«Что растёт у опушки?»', next: 'herbs' },
          {
            label: '«Мне нужен отвар.»',
            next: 'potion',
            effect: giveHerbalistGift,
          },
          { label: '«Почему деревня умирает?»', next: 'village' },
        ],
      },
      herbs: {
        text: [
          '— Травы. Пучки у самой кромки, ягоды на старом кусте, сухостой после ветровала. ' +
            'Две горсти трав на костёр — и будет отвар. Только не вытопчи всё разом: трава не железо, за ночь не нарастёт.',
        ],
        choices: [{ label: 'Закончить разговор', close: true }],
      },
      potion: {
        text: [
          '— Нужен — так свари. Две горсти трав, костёр, полчаса терпения. ' +
            'Держи один, пусть будет. В это лето без отвара далеко не уйдёшь.',
        ],
        choices: [{ label: 'Закончить разговор', close: true }],
      },
      village: {
        text: [
          '— Не урожай её убил и не бандиты. Люди уходят. Сначала по одному, потом семьями. ' +
            'Остались те, кому идти некуда. Ты, Зар, — тоже остался. Хоть на тебя одна надежда.',
        ],
        choices: [{ label: 'Закончить разговор', close: true }],
      },
    },
    onClose: finishHerbalistTalk,
  });
}

export function openElder() {
  const flags = store.state.flags;
  const trade = { label: '«Показать товар.»', effect: () => { closeDialogue(); openTab('trade'); } };

  let dialogue;

  const state = store.state;

  if (state.stage >= 2) {
    if (!flags.chapter2_reported) {
      const smithy = state.buildings.smithy?.level ?? 0;
      const tools =
        (state.resources.knife ?? 0) >= 1 && (state.resources.axe ?? 0) >= 1;
      const supplies =
        (state.resources.meat ?? 0) >= 3 && (state.resources.hide ?? 0) >= 1;

      if (smithy < 1) {
        dialogue = {
          speaker: 'Радим',
          role: 'староста',
          nodes: {
            start: {
              text: [
                '— Кузница? Нет кузницы. Строй — потом поговорим.',
                '— Без своего горна мы так и будем покупать гвозди у Аскольда.',
              ],
              choices: [{ label: '«Понял, отец.»', close: true }],
            },
          },
        };
      } else if (!tools) {
        dialogue = {
          speaker: 'Радим',
          role: 'староста',
          nodes: {
            start: {
              text: [
                '— Инструмент где? Нож и топор. Кузнец без дела не сидит.',
                '— Сделай инструмент — тогда и в лес, и к Мирне, и к камню.',
              ],
              choices: [{ label: '«Сделаю.»', close: true }],
            },
          },
        };
      } else if (!supplies) {
        dialogue = {
          speaker: 'Радим',
          role: 'староста',
          nodes: {
            start: {
              text: [
                '— Мясо и шкура. Глухой бор ждёт.',
                '— Без припасов зима съест нас быстрее бандитов.',
              ],
              choices: [{ label: '«Пойду на охоту.»', close: true }],
            },
          },
        };
      } else {
        dialogue = {
          speaker: 'Радим',
          role: 'староста',
          nodes: {
            start: {
              text: [
                '— Мясо есть, инструмент есть. Зима не страшна.',
                '— Двадцать серебра за работу. Деревня растёт, сын.',
              ],
              choices: [
                { label: '«Спасибо, отец.»', effect: finishStage2, close: true },
              ],
            },
          },
        };
      }
    } else {
      dialogue = {
        speaker: 'Радим',
        role: 'староста',
        nodes: {
          start: {
            text: [
              '— Кузница дымит, кладовая полна. Продолжай, сын.',
              '— Деревня растёт. Глядишь, скоро о нас заговорят соседи.',
            ],
            choices: [{ label: '«Постараюсь, отец.»', close: true }],
          },
        },
      };
    }

    openDialogue(dialogue);
    return;
  }

  if (!flags.chapter1_first_steps_done) {
    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: [
            '— Работай, сын. Деревня не ждёт.',
            '— Вернись, когда закончишь с травой, частоколом и Мирной. Поговорим.',
          ],
          choices: [{ label: 'Ясно.', close: true }],
        },
      },
    };
  } else if (!flags.elder_reported) {
    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: [
            '— Вернулся. Травы собрал? Частокол держится?',
            '— Сядь. Деревня не умрёт сегодня — уже хорошо.',
            '— У ворот стоит Аскольд. Он привёз весть из Лозичей: там ищут отвары и сушёные ягоды. ' +
              'Возьми у него заказ. Деревне нужны деньги, а тебе — дело.',
          ],
          choices: [
            { label: '«Что за заказ?»', next: 'details' },
            { label: '«Я пойду.»', effect: acceptElderTask, close: true },
          ],
        },
        details: {
          text: [
            '— Три отвара и две порции вяленых ягод. Аскольд платит серебром.',
            '— И не тяни. Караван уйдёт — заказ уйдёт вместе с ним.',
          ],
          choices: [
            { label: '«Я пойду.»', effect: acceptElderTask, close: true },
          ],
        },
      },
    };
  } else if (!flags.askold_briefed) {
    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: ['— Аскольд ждёт тебя у ворот. Не заставляй его ждать.'],
          choices: [{ label: 'Иду.', close: true }],
        },
      },
    };
  } else if (!flags.askold_order_done) {
    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: ['— Заказ ещё не закрыт? Аскольд не любит ждать.'],
          choices: [
            { label: 'Займусь.', close: true },
            trade,
          ],
        },
      },
    };
  } else if (!flags.elder_final_report) {
    const coin = store.state.resources.coin ?? 0;

    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: [
            '— Вернулся. Аскольд доволен?',
            '— Тридцать серебра — хорошее начало. Но не всё серебро твоё. ' +
              'Пятнадцать отдай в общий котёл: семена, смола, соль. Деревня должна жить дальше.',
          ],
          choices: [
            {
              label: `«Вот ${ELDER_TITHE} серебра.»`,
              next: () => (payElderTithe() ? 'final' : 'need_money'),
            },
            { label: '«Мне нужно собрать серебро.»', close: true },
          ],
        },
        need_money: {
          text: [
            `— Не хватает. Нужно ${ELDER_TITHE} серебра, а у тебя ${coin}.`,
            '— Принеси, когда будет. Деревня подождёт, но недолго.',
          ],
          choices: [{ label: '«Принесу.»', close: true }],
        },
        final: {
          text: [
            '— Пятнадцать серебра в общем котле. Семена куплены, смола будет.',
            '— Продолжай стараться, сын. Глядишь, деревня окрепнет.',
          ],
          choices: [{ label: '«Постараюсь, отец.»', close: true }],
        },
      },
    };
  } else {
    dialogue = {
      speaker: 'Радим',
      role: 'староста',
      nodes: {
        start: {
          text: [
            '— Пятнадцать серебра в общем котле. Семена куплены, смола будет.',
            '— Продолжай стараться, сын. Глядишь, деревня окрепнет.',
          ],
          choices: [{ label: '«Постараюсь, отец.»', close: true }],
        },
      },
    };
  }

  openDialogue(dialogue);
}

export function openAskold() {
  const flags = store.state.flags;
  const state = store.state;
  const trade = { label: '«Показать товар.»', effect: () => { closeDialogue(); openTab('trade'); } };
  const leave = { label: 'Уйти', close: true };

  let dialogue;

  if (!flags.elder_reported) {
    dialogue = {
      speaker: 'Аскольд',
      role: 'торговец-странник',
      nodes: {
        start: {
          text: [
            '— Товар есть, серебро есть, а времени мало. Смотри, выбирай — второй раз я сюда не скоро загляну.',
          ],
          choices: [trade, leave],
        },
      },
    };
  } else if (!flags.askold_briefed) {
    dialogue = {
      speaker: 'Аскольд',
      role: 'торговец-странник',
      nodes: {
        start: {
          text: [
            '— А, сын старосты. Отец прислал?',
            '— Дело есть. В Лозичах ждут три отвара и две порции вяленых ягод.',
            '— Принесёшь — тридцать серебра. Не принесёшь — следующий караван пройдёт мимо.',
          ],
          choices: [
            { label: '«Беру заказ.»', effect: acceptAskoldOrder, close: true },
            trade,
            { label: '«Мне надо подумать.»', next: 'think' },
          ],
        },
        think: {
          text: ['— Думай. Только караван ждать не будет.'],
          choices: [leave],
        },
      },
    };
  } else if (!flags.askold_order_done) {
    if (canDeliverAskoldOrder()) {
      dialogue = {
        speaker: 'Аскольд',
        role: 'торговец-странник',
        nodes: {
          start: {
            text: [
              '— Принёс? Показывай.',
              '— Три отвара, две порции. Как договаривались.',
            ],
            choices: [
              { label: '«Вот товар.»', effect: deliverAskoldOrder, close: true },
              { label: '«Ещё не всё.»', close: true },
            ],
          },
        },
      };
    } else {
      dialogue = {
        speaker: 'Аскольд',
        role: 'торговец-странник',
        nodes: {
          start: {
            text: [
              `— Три отвара и две порции ягод. У тебя: ${state.resources.potion ?? 0} и ${state.resources.dried_berries ?? 0}.`,
              '— Принеси — заплачу.',
            ],
            choices: [{ label: '«Буду.»', close: true }, trade],
          },
        },
      };
    }
  } else {
    dialogue = {
      speaker: 'Аскольд',
      role: 'торговец-странник',
      nodes: {
        start: {
          text: [
            '— Заказ ушёл в Лозичи. Довольны.',
            '— Приходи, когда будет что продать.',
          ],
          choices: [trade, leave],
        },
      },
    };
  }

  openDialogue(dialogue);
}

export function initDialogue() {
  document.addEventListener('keydown', (event) => {
    if (!isOpen) return;
    if (event.key === 'Escape') closeDialogue();
  });
}

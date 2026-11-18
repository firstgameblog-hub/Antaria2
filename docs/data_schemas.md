# Схемы данных (v1.1)

Документ этапа 1.3, дополнен этапом 2. Описывает конфиги в `data/` и формат
сохранения. Источник правды для кода — сами модули; здесь зафиксированы поля
и правила, чтобы новые данные не ломали старые.

## Общие правила

- Все справочники — обычные объекты, ключ совпадает с `id`.
- Числовые стадии: 1–7, см. `docs/village_stages.md`.
- Ресурсы ссылаются друг на друга только по `id`.
- При старте `validateData()` проверяет ссылки и пишет проблемы в консоль;
  та же проверка доступна как `npm run check`.
- Контент не содержит логики: только числа, тексты и флаги.

## 1. Ресурс (`data/resources.js`)

```js
{
  id: 'herb',
  name: 'Травы',
  kind: 'plant',          // plant | wood | mineral | product | material | currency
  stages: [1],            // с каких стадий доступен
  price: 2,               // базовая цена в серебре
  lore: 'Короткий абзац «из книги».'
}
```

Правила:

- `id` уникален и используется в рецептах, постройках, квестах, локациях.
- `stages` — непустой массив; интерфейс показывает ресурс, если его
  минимальная стадия не выше текущей.
- `coin` — единственная валюта, `kind: 'currency'`.

## 2. Постройка (`data/buildings.js`)

```js
{
  id: 'smithy',
  name: 'Кузница',
  stageFrom: 2,
  unique: true,
  effects: { craftStations: ['smithy'] },
  cost: { branch: 150, stone: 100 },
  lore: 'Текст-описание.'
}
```

Правила:

- `effects` может содержать `craftStations`, `housing`, `defense`, `storage`,
  `food`; неизвестные ключи игнорируются.
- `cost` — ресурсы и количества; проверяются на существование `id`.
- Постройка не удаляется из справочника при росте стадии — меняется её вид.

## 3. Рецепт (`data/recipes.js`)

```js
{
  id: 'herb_potion',
  name: 'Отвар из трав',
  station: 'campfire',    // станция из buildings.effects.craftStations
  minutes: 30,            // игровое время приготовления
  stages: [1],
  ingredients: { herb: 2 },
  output: { potion: 1 },
  lore: 'Текст-описание.'
}
```

Правила:

- Все `ingredients` и `output` существуют в `RESOURCES`.
- `station` обязан существовать хотя бы у одной постройки.
- Один рецепт даёт один результат (несколько — через отдельные записи).

## 4. Квест (`data/quests.js`)

```js
{
  id: 'chapter1_first_steps',
  chapter: 1,
  title: 'Первые шаги',
  from: 'Радим, староста',
  to: 'Зар',
  intro: 'Текст письма или разговора.',
  steps: [
    { id: 'gather_herbs', text: 'Собрать травы', counter: 'herb', target: 10 },
    { id: 'repair_palisade', text: 'Починить частокол', counter: 'palisade', target: 0.7 },
    { id: 'talk_herbalist', text: 'Поговорить с травницей', flag: 'met_herbalist' }
  ],
  rewards: { coin: 10, flag: 'chapter1_steps_started' }
}
```

Правила:

- У шага есть либо `counter + target`, либо `flag`.
- `counter` — id ресурса или служебный `palisade`; `palisade` измеряется
  долей от 0 до 1.
- Квест закрывается, когда выполнены все шаги; награда выдаётся один раз
  (флаг `<quest.id>_done`).

## 5. Стадия (`data/stages.js`)

```js
{
  id: 1,
  name: 'Умирающая деревня',
  population: 20,
  chapter: 'Пробуждение',
  summary: 'Короткое состояние деревни.',
  unlocks: ['Сбор трав', 'Отвар'],
  requirements: ['150 трав и ягод', '300 монет']
}
```

Правила:

- Ключи — числа 1–7 без пропусков.
- `requirements` — человекочитаемые условия; точные проверки появятся
  на этапе 3 и будут ссылаться на те же поля.

## 6. Локация (`data/locations.js`)

```js
{
  id: 'edge',
  name: 'Опушка',
  stageFrom: 1,
  map: { left: 20, top: 14 },   // положение точки на карте, проценты 0–100
  description: 'Текст для панели локации.',
  nodes: [
    {
      id: 'edge_herbs',
      title: 'Пучки трав',
      resource: 'herb',
      amount: 5,          // сколько даёт один сбор (число)
      seconds: 2.6,       // длительность подхода в секундах
      text: 'Короткое описание узла.'
    }
  ],
  actions: ['read_chapter', 'sleep']
}
```

Правила:

- `nodes` и `actions` необязательны.
- `id` узла уникален по всем локациям; используется как ключ в `state.nodes`.
- `map.left` / `map.top` — проценты от размеров карты (0–100); проверяются
  при старте. Точки рисуются поверх `svg/stage-N/map.svg`.
- `actions` — id обработчиков из `src/ui/village.js` (`read_chapter`,
  `repair_palisade`, `open_craft`, `talk_herbalist`, `open_trade`, `sleep`).
- Узел отдаёт весь `amount` за один клик и обновляется на следующий день.
- `seconds` — сколько длится подход (по умолчанию 2.5 с). Пока идёт сбор,
  узел показывает полосу прогресса, остальные кнопки сбора заблокированы.

## 7. Торговец (`data/traders.js`)

```js
{
  id: 'askold',
  name: 'Аскольд',
  role: 'торговец-странник',
  intro: 'Реплика при открытии торговли.',
  buyMarkup: 1.5,        // цена покупки = price * buyMarkup
  sellMarkup: 0.6,       // цена продажи = price * sellMarkup
  stock: { potion: 2, dried_berries: 3 }
}
```

Правила:

- `stock` — стартовый запас; в состоянии игры хранится его копия и уменьшается
  при покупке.
- Торговое чутьё героя даёт скидку 3% за каждый пункт выше 3 при покупке
  и такую же надбавку при продаже.
- Цена округляется и не бывает ниже 1.

## 8. Глава (`data/chapter1.js`)

```js
{
  id: 'chapter1',
  number: 1,
  roman: 'I',
  title: 'Пробуждение',
  pages: [
    { kind: 'cover', title, epigraph, note },
    { kind: 'text', paragraphs: [], glitch: [], afterGlitch: '' },
    { kind: 'choice', paragraphs: [], prompt, choices: [
      { id, label, trust, response }
    ] },
    { kind: 'letter', paragraphs: [], letter: { from, to, subject, lines: [] } }
  ]
}
```

Правила:

- `pages` — непустой массив, порядок = порядок чтения.
- У страницы-выбора выбранный `id` сохраняется в `state.flags.chapter1_reply`.
- `letter.lines` — массив строк письма, а не один абзац.
- Текст главы — часть книги; в интерфейсе нет «задания 4 из 10».

## Крафт в состоянии

Задание крафта живёт в `state.crafting`:

```js
{
  id: 'craft-...',
  recipeId: 'herb_potion',
  endsAt: 510            // абсолютные игровые минуты от начала игры
}
```

Абсолютное время = `(day - 1) * 1440 + minutes`. Готовность проверяется
на каждой игровой минуте, поэтому крафт завершается и в другой вкладке.

## Узлы сбора в состоянии

```js
state.nodes = {
  edge_herbs: { charges: 0, day: 4 }
}
```

`charges` — сколько осталось в узле, `day` — день последнего сбора.
Если `day` не совпадает с текущим, узел считается полным.

## Формат сохранения

Ключи localStorage: `antaria.save.auto`, `antaria.save.manual`.
Текущая версия состояния — 2.

```json
{
  "app": "antaria",
  "version": 2,
  "savedAt": 1760000000000,
  "state": {
    "version": 2,
    "stage": 1,
    "population": 20,
    "time": { "day": 1, "minutes": 480, "speed": 1, "paused": false, "uiPaused": false },
    "player": { "name": "Зар", "strength": 2, "agility": 2, "trade": 3, "trust": 0 },
    "stats": { "herbGathered": 0, "coinsEarned": 0 },
    "resources": { "herb": 0, "berry": 0, "branch": 2, "coin": 15 },
    "buildings": { "elder_hut": 1, "house": 8, "palisade": 0.6 },
    "nodes": { "edge_herbs": { "charges": 5, "day": 1 } },
    "crafting": [],
    "trader": { "stock": { "potion": 2, "dried_berries": 3 } },
    "flags": { "chapter1_intro_done": true },
    "chronicle": [
      { "id": "ch-1", "day": 1, "title": "Деревня на грани", "text": "..." }
    ],
    "settings": { "sound": false },
    "meta": { "createdAt": 0, "updatedAt": 0 }
  }
}
```

Правила:

- `app` обязан быть `"antaria"` — чужие файлы не импортируются.
- Сейв версии 1 загружается: `hydrate()` добавляет новые поля, старые
  сохраняет; `uiPaused` всегда сбрасывается в `false`.
- `palisade` — доля целостности от 0 до 1 (`0.6` = 60%).
- Время: `minutes` — минуты внутри дня, 0–1439.
- `uiPaused` — пауза интерфейса (книга, диалог); не переживает перезагрузку.
- Экспорт скачивается как `antaria-day-N.json`.

## Что появится позже

- Схема жителя (имя, характер, умения, отношение).
- Схема заказа торговца и каравана.
- Схема боевой сцены и набега.
- Миграции версий сейва (`migrations`).

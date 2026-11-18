/**
 * Проверка данных без браузера: node tools/check.mjs
 * Ловит битые ссылки между справочниками до запуска игры.
 */

import { validateData } from '../data/index.js';

const problems = validateData();

if (problems.length === 0) {
  console.log('Данные в порядке: битых ссылок нет.');
  process.exit(0);
}

console.error(`Найдено проблем: ${problems.length}`);
for (const problem of problems) {
  console.error(`- ${problem}`);
}
process.exit(1);

# Крестики-нолики: Новая Эра

Учебный самостоятельный проект: браузерная игра «Крестики-нолики» на HTML, CSS и JavaScript. Игрок может выбрать игру с другом на одном устройстве или игру против бота, настроить тему и язык интерфейса.

Проект демонстрирует навыки Junior Frontend / Junior QA Engineer: работу с DOM и состояниями игры, адаптивную вёрстку, локализацию RU/EN, безопасное сохранение в `localStorage`, обработку недоступного Yandex Games SDK, тест-дизайн и Playwright smoke-тестирование.

## Возможности

- режимы «с другом» и «с ботом»;
- три уровня сложности бота;
- проверка победы, ничьей и невозможных ходов;
- повторный запуск партии и сброс счёта;
- шесть тем оформления;
- локализация RU/EN с fallback для локального запуска;
- сохранение темы и состояния игры в `localStorage`;
- адаптация desktop/mobile и обработка portrait-ориентации;
- интеграционные точки Yandex Games SDK: язык, `LoadingAPI`, `GameplayAPI` и реклама.

## Стек

HTML5, CSS3, JavaScript (CommonJS-инструменты для проверок), Node.js 20+, Playwright.

## Локальный запуск

Требуется Node.js 20 или новее.

```bash
npm ci
npm run dev
```

Откройте `http://127.0.0.1:4173`. Для остановки сервера нажмите `Ctrl+C`.

## Проверки и сборка

```bash
npm run check
npm run build
npm test
```

Для первого запуска Playwright установите браузер:

```bash
npx playwright install chromium
```

Также доступны `npm run test:e2e`, `npm run test:headed` и `npm run test:report`. В проекте нет отдельного bundler-а: `build` выполняет структурную и синтаксическую проверку статического приложения.

## Структура проекта

```text
.
├── index.html
├── style.css
├── script.js
├── scripts/
│   ├── check-structure.js
│   └── static-server.js
├── tests/e2e/tic-tac-toe.spec.js
├── qa/
└── .github/workflows/ci.yml
```

## Yandex Games SDK

SDK подключается динамически по адресу `/sdk.js`. Если SDK недоступен при локальном запуске, игра не имитирует успешную инициализацию и продолжает работу с безопасными fallback-значениями. На платформе используются доступные `environment.i18n`, `LoadingAPI`, `GameplayAPI` и Advertisement API. Реальный запуск внутри Yandex Games в этой проверке не выполнялся.

## Проверки качества

- Unit-тесты: отдельного unit-набора нет; критические пользовательские сценарии покрыты Playwright.
- E2E/smoke-тесты: 8 сценариев в desktop и mobile Chromium-конфигурациях.
- CI: GitHub Actions запускает `npm ci`, `npm run check`, `npm run build` и `npm run test:e2e` на `push` и `pull_request`.
- Ручное тестирование: в рамках этого аудита не выполнялось на физическом мобильном устройстве и внутри Yandex Games.
- Ограничения: не заявляется поддержка всех браузеров/устройств; Firefox, Safari, реальные устройства и опубликованная версия отдельно не проверялись.

## QA-документация

- [Тест-план](qa/TEST_PLAN.md)
- [Чек-лист](qa/CHECKLIST.md)
- [Тест-кейсы](qa/TEST_CASES.md)
- [Баг-репорты](qa/BUG_REPORTS.md)
- [Матрица трассируемости](qa/TRACEABILITY_MATRIX.md)
- [Отчёт о тестировании](qa/TEST_SUMMARY.md)

## Статус проекта

Рабочий учебный проект. Автоматизированный smoke-набор запускается в Chromium; ограничения проверки перечислены выше.

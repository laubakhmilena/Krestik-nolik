# Матрица трассируемости

| ID | Функция | Чек-лист | Тест-кейсы | Автотест |
|---|---|---|---|---|
| R-001 | Запуск | Раздел 1 | TC-001 | `loads the start screen` |
| R-002 | Start → Menu | Разделы 1–2 | TC-001 | `opens the main menu` |
| R-003 | Menu → Start | Раздел 2 | TC-002 | — |
| R-004 | Игра с другом | Раздел 3 | TC-003 | `starts friend mode` |
| R-005 | Чередование X/O | Раздел 3 | TC-004 | `alternates turns` |
| R-006 | Занятая клетка | Раздел 3 | TC-005 | `does not overwrite occupied cell` |
| R-007 | Победа по строке | Раздел 3 | TC-006 | `registers X horizontal win` |
| R-008 | Победа по диагонали | Раздел 3 | TC-007 | — |
| R-009 | Ничья | Раздел 3 | TC-008 | — |
| R-010 | Счёт | Раздел 3 | TC-006–008 | `increments X score` |
| R-011 | Новая партия | Раздел 3 | TC-009 | `restarts board and keeps score` |
| R-012 | Сброс счёта | Раздел 3 | TC-010 | `resets match score` |
| R-013 | Выход | Раздел 3 | TC-011–012 | `opens and cancels exit confirmation` |
| R-014 | Сложность бота | Раздел 4 | TC-013 | `opens bot difficulty selection` |
| R-015 | Ход бота | Раздел 4 | TC-014 | — |
| R-016 | Блокировка ввода | Раздел 4 | TC-015 | — |
| R-017 | Переключение темы | Раздел 5 | TC-016 | `changes and persists theme` |
| R-018 | Сохранение темы | Раздел 5 | TC-017–018 | `changes and persists theme` |
| R-019 | Keyboard | Раздел 8 | TC-019 | частично |
| R-020 | Fallback без SDK | Раздел 9 | TC-020 | — |
| R-021 | Zoom | Раздел 8 | TC-021 | — |
| R-022 | Orientation | Разделы 7–8 | TC-022 | — |
| R-023 | Локализация | Раздел 6 | exploratory | — |
| R-024 | Адаптивность | Раздел 7 | viewport matrix | mobile project |

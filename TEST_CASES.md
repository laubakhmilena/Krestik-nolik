name: Bug report
description: Сообщить о дефекте в игре
title: "[BUG] "
labels:
  - bug
body:
  - type: markdown
    attributes:
      value: |
        Заполните поля так, чтобы дефект можно было воспроизвести без уточнений.

  - type: input
    id: environment
    attributes:
      label: Окружение
      description: ОС, браузер, версия, устройство, разрешение
      placeholder: Windows 11, Chrome 126, 1920×1080
    validations:
      required: true

  - type: input
    id: build
    attributes:
      label: Версия или commit
      placeholder: main / commit SHA
    validations:
      required: true

  - type: textarea
    id: preconditions
    attributes:
      label: Предусловия
    validations:
      required: true

  - type: textarea
    id: steps
    attributes:
      label: Шаги воспроизведения
      placeholder: |
        1. Открыть...
        2. Нажать...
        3. Проверить...
    validations:
      required: true

  - type: textarea
    id: actual
    attributes:
      label: Фактический результат
    validations:
      required: true

  - type: textarea
    id: expected
    attributes:
      label: Ожидаемый результат
    validations:
      required: true

  - type: dropdown
    id: severity
    attributes:
      label: Severity
      options:
        - Blocker
        - Critical
        - Major
        - Minor
        - Trivial
    validations:
      required: true

  - type: dropdown
    id: reproducibility
    attributes:
      label: Воспроизводимость
      options:
        - 100%
        - Часто
        - Иногда
        - Один раз
    validations:
      required: true

  - type: textarea
    id: evidence
    attributes:
      label: Вложения и логи
      description: Скриншоты, видео, HAR, stack trace, Console

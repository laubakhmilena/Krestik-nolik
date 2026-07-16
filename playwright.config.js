# Как применить файлы

1. Распакуйте архив.
2. Скопируйте содержимое папки в корень `Krestik-nolik`.
3. Подтвердите замену `README.md`.
4. Исходные `index.html`, `script.js`, `style.css` не заменяются.
5. Выполните:

```bash
npm install
npx playwright install chromium
npm test
```

6. Затем:

```bash
git add .
git commit -m "Add QA portfolio documentation and Playwright tests"
git push
```

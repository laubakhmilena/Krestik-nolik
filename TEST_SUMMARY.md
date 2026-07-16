name: Playwright E2E

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v5

      - name: Set up Node.js
        uses: actions/setup-node@v6
        with:
          node-version: "lts/*"

      - name: Install dependencies
        run: npm install

      - name: Install Chromium
        run: npx playwright install chromium --with-deps

      - name: Run tests
        run: npm test

      - name: Upload report
        if: ${{ !cancelled() }}
        uses: actions/upload-artifact@v5
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14

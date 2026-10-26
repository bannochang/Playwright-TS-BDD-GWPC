# Guidewire Playwright BDD

Playwright and `playwright-bdd` test project for Guidewire PolicyCenter. The current smoke feature describes the Commercial Auto policy lifecycle, from starting a submission through retrieving an issued policy.

## Requirements

- Node.js (LTS recommended)
- npm
- Access to a configured Guidewire PolicyCenter environment to run end-to-end tests

## Setup

Install the project dependencies and Playwright browsers:

```bash
npm ci
npx playwright install
```

On Linux CI machines, install the browser system dependencies as well:

```bash
npx playwright install --with-deps
```

## Run tests

Generate Playwright tests from the BDD feature files and run them:

```bash
npm test
```

Generate the BDD tests without running them:

```bash
npm run bddgen
```

The Playwright configuration targets Chromium, Firefox, and WebKit. The HTML report is written to `playwright-report/`; test output is written to `test-results/`.

## Project layout

```text
tests/
  UI_test/
    SmokeTest_GWPC/
      features/
        Smoke.feature
        Steps/
          smoke.steps.ts
      fixture/
      pages/
playwright.config.ts
```

The smoke feature contains scenarios for Commercial Auto submission, risk details, quoting, binding and issuance, and policy retrieval. The current step definitions are scaffolding; connect them to the Guidewire environment and add browser interactions and assertions before relying on these scenarios for end-to-end validation.

## CI

The GitHub Actions workflow in `.github/workflows/playwright.yml` installs dependencies and Playwright browsers, runs Playwright tests, and uploads the HTML report as an artifact.

import { getIssuedPolicyNumber } from '../../utils/results.utils';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';


const { Given, When, Then } = createBdd();

const applicationUrl =
  'https://pc-dev-gwcpdev.cpstratus.zeta1-andromeda.guidewire.net/PolicyCenter.do?iss=https%3A%2F%2Fguidewire-hub.okta.com';
const testDataPath = path.resolve(
  'tests/UI_test/SmokeTest_GWPC/test-data.json',
);

interface LoginTestData {
  Login: {
    Username: string;
    Password: string;
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}


async function loadLoginTestData(): Promise<LoginTestData> {
  let contents: string;

  try {
    contents = await readFile(testDataPath, 'utf8');
  } catch (error) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    ) {
      throw new Error(
        `Missing local test data at ${testDataPath}. Copy test-data.example.json to test-data.json and configure the credentials.`,
      );
    }

    throw error;
  }

  const parsed: unknown = JSON.parse(contents);

  if (!isRecord(parsed) || !isRecord(parsed.Login)) {
    throw new Error(
      'Invalid test data: expected a Login object containing Username and Password.',
    );
  }

  const login = parsed.Login;

  if (
    typeof login.Username !== 'string' ||
    !login.Username.trim() ||
    typeof login.Password !== 'string' ||
    !login.Password
  ) {
    throw new Error(
      'Invalid test data: Login.Username and Login.Password must be non-empty strings.',
    );
  }

  return {
    Login: {
      Username: login.Username,
      Password: login.Password,
    },
  };
}


function workflowStepPending(step: string): never {
  throw new Error(
    `PolicyCenter workflow step is not automated yet: "${step}". Implement it after confirming the corresponding page fields and actions.`,
  );
}

Given('I am logged in to Guidewire PolicyCenter', async ({ page }) => {
  const loginData = await loadLoginTestData();

  await page.goto(applicationUrl, { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('textbox', { name: 'Username', exact: true })
    .fill(loginData.Login.Username);

  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill(loginData.Login.Password);
  await page.getByRole('button', { name: 'Log In', exact: true }).click();

  await expect(
    page.getByRole('button', { name: 'Log In', exact: true }),
  ).toBeHidden({ timeout: 60_000 });
});

When('the user starts a new Commercial Auto submission', async ({ }) =>
  workflowStepPending('the user starts a new Commercial Auto submission'),
);

When('the user selects an effective date', async ({ }) =>
  workflowStepPending('the user selects an effective date'),
);

When('the user enters the commercial account details', async ({ }) =>
  workflowStepPending('the user enters the commercial account details'),
);

When('the user adds a vehicle with valid vehicle details', async ({ }) =>
  workflowStepPending('the user adds a vehicle with valid vehicle details'),
);

When('the user adds a driver with valid driver details', async ({ }) =>
  workflowStepPending('the user adds a driver with valid driver details'),
);

When('the user selects the required coverages', async ({ }) =>
  workflowStepPending('the user selects the required coverages'),
);

When('the user completes the underwriting information', async ({ }) =>
  workflowStepPending('the user completes the underwriting information'),
);

When('the user requests a policy quote', async ({ }) =>
  workflowStepPending('the user requests a policy quote'),
);

Then('the quote should be generated successfully', async ({ }) =>
  workflowStepPending('the quote should be generated successfully'),
);

Then('the user issues the policy', async ({ }) =>
  workflowStepPending('the user issues the policy'),
);

Then('the policy status should be {string}', async ({ }, status: string) =>
  workflowStepPending(`the policy status should be "${status}"`),
);

Then('the policy number should be generated', async ({ }) =>
  workflowStepPending('the policy number should be generated'),
);

Then('the issued policy should be available in PolicyCenter', async ({ }) =>
  workflowStepPending('the issued policy should be available in PolicyCenter'),
);

let retrievedPolicyNumber: string;

Given(
  'a Commercial Auto policy has been issued successfully',
  async ({ }) => {
    retrievedPolicyNumber =
      await getIssuedPolicyNumber('PolicyRun_001');

    expect(retrievedPolicyNumber).toBeTruthy();
  },
);

When(
  'the user searches for the policy using its policy number',
  async ({ page }) => {
    expect(retrievedPolicyNumber).toBeTruthy();

    // Temporary confirmation until we implement the PolicyCenter search UI.
    console.log(
      `Policy number to search in PolicyCenter: ${retrievedPolicyNumber}`,
    );
  },
);

Then('the policy should be displayed', async ({ }) =>
  workflowStepPending('the policy should be displayed'),
);

Then('the insured account details should be displayed', async ({ }) =>
  workflowStepPending('the insured account details should be displayed'),
);

Then('the vehicle details should match the issued policy', async ({ }) =>
  workflowStepPending('the vehicle details should match the issued policy'),
);

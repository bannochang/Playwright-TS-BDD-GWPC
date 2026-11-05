import {
  getIssuedPolicyNumber,
  savePolicyResult,
} from '../../utils/results.utils';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { AccountPage } from '../../pages/AccountPage';
import { AccountLocators } from '../../locators/AccountLocators';
import { NewSubmission } from '../../pages/newSubmission';


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
interface AccountTestData {
  Account: {
    Company: {
      CompanyName: string;
      OrganizationName: string;
      AddressLine1: string;
      City: string;
      County: string;
      State: string;
      PostalCode: string;
      Country: string;
      "Address Type": string;
      "Organization Type": string;
      FEIN: string;
      "Producer Code": string;
    };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
function requiredString(
  record: Record<string, unknown>,
  field: string,
): string {
  const value = record[field];

  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      `Invalid test data: Account.Company.${field} must be a non-empty string.`,
    );
  }

  return value;
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
async function loadAccountTestData(): Promise<AccountTestData> {
  const contents = await readFile(testDataPath, 'utf8');
  const parsed: unknown = JSON.parse(contents);

  if (!isRecord(parsed) || !isRecord(parsed.Account)) {
    throw new Error('Invalid test data: Account section is missing.');
  }

  const account = parsed.Account;

  if (!isRecord(account.Company)) {
    throw new Error('Invalid test data: Account.Company section is missing.');
  }

  const company = account.Company;

  const requiredFields = [
    'CompanyName',
    'OrganizationName',
    'AddressLine1',
    'City',
    'County',
    'State',
    'PostalCode',
    'Country',
    'Address Type',
    'Organization Type',
    'FEIN',
    'Producer Code',
  ] as const;

  for (const field of requiredFields) {
    if (
      typeof company[field] !== 'string' ||
      !company[field].trim()
    ) {
      throw new Error(
        `Invalid test data: Account.Company.${field} must be a non-empty string.`,
      );
    }
  }

  return {
    Account: {
      Company: {
        CompanyName: requiredString(company, 'CompanyName'),
        OrganizationName: requiredString(company, 'OrganizationName'),
        AddressLine1: requiredString(company, 'AddressLine1'),
        City: requiredString(company, 'City'),
        County: requiredString(company, 'County'),
        State: requiredString(company, 'State'),
        PostalCode: requiredString(company, 'PostalCode'),
        Country: requiredString(company, 'Country'),
        'Address Type': requiredString(company, 'Address Type'),
        'Organization Type': requiredString(company, 'Organization Type'),
        FEIN: requiredString(company, 'FEIN'),
        'Producer Code': requiredString(company, 'Producer Code'),
      },
    },
  };
}

function workflowStepPending(step: string): never {
  test.skip(
    true,
    `PolicyCenter workflow step is not automated yet: "${step}". Implement it after confirming the corresponding page fields and actions.`,
  );
  throw new Error(`PolicyCenter workflow step was not skipped: "${step}".`);
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

When('the user opens the Account menu', async ({ page }) => {
  const accountMenuArrow = page.locator(AccountLocators.accountMenuArrow);
  const newAccountMenuItem = page.locator(
    AccountLocators.newAccountMenuItem,
  );

  await expect(accountMenuArrow).toBeVisible();
  await expect(accountMenuArrow).toBeEnabled();
  await accountMenuArrow.click();
  await expect(newAccountMenuItem).toBeVisible({ timeout: 10_000 });
});
When('the user selects New Account', async ({ page }) => {
  const newAccountMenuItem = page.locator(
    AccountLocators.newAccountMenuItem,
  );

  await expect(newAccountMenuItem).toBeVisible();
  await newAccountMenuItem.click();
  await expect(
    page.locator(AccountLocators.companyNameInput),
  ).toBeVisible({ timeout: 15_000 });
});
When('the user enters the company name', async ({ page }) => {
  const accountData = await loadAccountTestData();

  const accountPage = new AccountPage(page);

  await accountPage.enterCompanyName(
    accountData.Account.Company.CompanyName
  );

  console.log(
    'Company name entered:',
    accountData.Account.Company.CompanyName
  );
});
When('the user clicks the Search button', async ({ page }) => {
  const accountPage = new AccountPage(page);

  await accountPage.searchAccount();

  console.log('Company account search initiated.');
});
When('the user selects Company Account', async ({ page }) => {
  const accountPage = new AccountPage(page);

  await accountPage.clickCreateAccount();
  await accountPage.selectCompanyAccount();

  console.log('Company Account selected successfully.');
});
When('the user enters the Company Account details', async ({ page }) => {
  const accountData = await loadAccountTestData();
  const accountPage = new AccountPage(page);
  const companyData = accountData.Account.Company;

  await accountPage.enterCompanyAccountName(companyData.CompanyName);
  await accountPage.enterCompanyAccountDetails(companyData);
});
When('the user clicks the Update button', async ({ page }) => {
  const accountPage = new AccountPage(page);

  await accountPage.clickUpdateButton();

  console.log('Update button clicked successfully.');
});

Then('the user saves the created Account Number', async ({ page }) => {
  const accountPage = new AccountPage(page);

  const accountNumber = await accountPage.getAccountNumber();

  await savePolicyResult('TC_ACCOUNT_001', {
    AccountNumber: accountNumber,
  });

  console.log('Account Number saved in results.json:', accountNumber);
});

When('the user starts a new Commercial Auto submission', async ({ page }) => {
  const newSubmissionPage = new NewSubmission(page);

  await newSubmissionPage.clickNewSubmission();

  console.log('New Commercial Auto submission initiated.');
  await newSubmissionPage.selectProduct();

  console.log('Policy Info Screen displayed.');
});

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
Then(
  'the PolicyCenter home page should be displayed',
  async ({ page }) => {
    await expect(page).not.toHaveURL(/login/i);

    console.log('PolicyCenter login completed.');
    console.log('Current URL:', page.url());
  },
);

import { expect, Page } from '@playwright/test';
import { newSubmissionLocators } from '../locators/newSubmissionLocators';
import { policyinfoLocators } from '../locators/policyinfoLocators';

export class NewSubmission {
  constructor(private page: Page) { }

  async clickNewSubmission(): Promise<void> {
    const newSubmissionButton = this.page.locator(
      newSubmissionLocators.NewSubmissionButton
    );

    await expect(newSubmissionButton).toBeVisible();
    await newSubmissionButton.click();
    await expect(
      this.page.getByRole('heading', { name: 'New Submissions', exact: true }),
    ).toBeVisible({ timeout: 15_000 });

    console.log('New Submission button clicked successfully.');
  }
  async selectProduct(): Promise<void> {
    const commercialAutoRow = this.page
      .getByRole('row')
      .filter({ hasText: 'Go Commercial Auto' })
      .last();
    const selectButton = commercialAutoRow.getByRole('button', {
      name: 'Select',
      exact: true,
    });

    await expect(selectButton).toBeVisible();
    await expect(selectButton).toBeEnabled();
    await selectButton.click();

    await expect(
      this.page.getByRole('heading', { name: 'Policy Info', exact: true }),
    ).toBeVisible({ timeout: 15_000 });

    /*await this.page.screenshot({
      path: 'test-results/policy-info-screen.png',
      fullPage: true,
    });*/
    console.log('Policy Info screen screenshot saved to test-results/policy-info-screen.png.');
  }
}

export class PolicyInfo {
  constructor(private page: Page) { }

  async selectOrganizationType(): Promise<void> {
    await expect(
      this.page.getByRole('heading', { name: 'Policy Info', exact: true }),
    ).toBeVisible({ timeout: 15_000 });

    const organizationTypeInput = this.page.getByRole('combobox', {
      name: 'Organization Type',
      exact: true,
    });

    await expect(organizationTypeInput).toBeVisible();
    await expect(organizationTypeInput).toBeEnabled();
    await organizationTypeInput.selectOption({ label: 'LLC' });
    await expect(
      organizationTypeInput.locator('option:checked'),
    ).toHaveText('LLC');

    const nextButton = this.page.getByRole('button', {
      name: 'Next',
      exact: true,
    });
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    await expect(
      this.page.getByRole('main').getByRole('heading', {
        name: 'Go Commercial Auto',
        exact: true,
      }),
    ).toBeVisible({ timeout: 15_000 });

    await this.page.screenshot({
      path: 'test-results/go-commercial-auto-screen.png',
      fullPage: true,
    });
    console.log('Navigated to the Go Commercial Auto screen.');
  }
}
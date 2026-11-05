import { expect, Page } from '@playwright/test';
import { newSubmissionLocators } from '../locators/newSubmissionLocators';

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

    await this.page.screenshot({
      path: 'test-results/policy-info-screen.png',
      fullPage: true,
    });
    console.log('Policy Info screen screenshot saved to test-results/policy-info-screen.png.');
  }
}
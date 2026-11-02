import { Page, expect } from '@playwright/test';
import { AccountLocators } from '../locators/AccountLocators';

export class AccountPage {
  constructor(private page: Page) { }

  async enterCompanyName(companyName: string): Promise<void> {
    const companyNameInput = this.page.locator(
      AccountLocators.companyNameInput
    );

    await expect(companyNameInput).toBeVisible();
    await companyNameInput.fill(companyName);
  }

  async searchAccount(): Promise<void> {
    const searchButton = this.page.locator(
      AccountLocators.searchButton
    );

    await expect(searchButton).toBeVisible();
    await searchButton.click();
  }

  async clickCreateAccount(): Promise<void> {
    const createAccountButton = this.page.getByRole(
      'button',
      { name: 'Create New Account', exact: true }
    );

    await expect(createAccountButton).toBeVisible();
    await createAccountButton.click();

    const companyOption = this.page.getByRole(
      'menuitem',
      { name: 'Company', exact: true }
    );

    await expect(companyOption).toBeVisible();

    console.log('Create New Account menu opened.');
  }

  async selectCompanyAccount(): Promise<void> {
    const companyOption = this.page.getByRole(
      'menuitem',
      { name: 'Company', exact: true }
    );

    await expect(companyOption).toBeVisible();
    await companyOption.click();

    console.log('Company Account option selected successfully.');
    await this.page.pause();
  }
}
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

    console.log('Create New Account button clicked.');
  }

  async selectCompanyAccount(): Promise<void> {
    const companyOption = this.page.getByRole('menuitem', {
      name: 'Company',
      exact: true,
    });

    await expect(companyOption).toBeVisible({ timeout: 15_000 });
    await companyOption.click();

    console.log('Company Account option selected successfully.');
  }
  async enterCompanyAccountName(companyName: string): Promise<void> {
    const companyNameInput = this.page.locator(
      AccountLocators.companyAccountNameInput
    );

    await expect(companyNameInput).toBeVisible();
    await companyNameInput.fill(companyName);

    console.log('Company Account Name entered:', companyName);
  }
  async selectCountry(country: string): Promise<void> {
    const countryDropdown = this.page.locator(
      AccountLocators.CountryDropdown
    );

    await expect(countryDropdown).toBeVisible();
    await countryDropdown.selectOption({ label: country });

    console.log(`Country selected: ${country}`);
  }

  async enterAddressLine1(address: string): Promise<void> {
    const addressLine1Input = this.page.locator(
      AccountLocators.AddressLine1Input
    );

    await expect(addressLine1Input).toBeVisible();
    await addressLine1Input.fill(address);

    console.log(`Address entered: ${address}`);
  }

  async enterCity(city: string): Promise<void> {
    const cityInput = this.page.locator(AccountLocators.CityInput);

    await expect(cityInput).toBeVisible();
    await cityInput.fill(city);

    console.log(`City entered: ${city}`);
  }

  async enterCounty(county: string): Promise<void> {
    const countyInput = this.page.locator(AccountLocators.CountyInput);

    await expect(countyInput).toBeVisible();
    await countyInput.fill(county);

    console.log(`County entered: ${county}`);
  }

  async selectState(state: string): Promise<void> {
    const stateDropdown = this.page.locator(
      AccountLocators.StateDropdown
    );

    await expect(stateDropdown).toBeVisible();
    await stateDropdown.selectOption({ label: state });

    console.log(`State selected: ${state}`);
  }

  async enterZipCode(zipCode: string): Promise<void> {
    const zipCodeInput = this.page.locator(AccountLocators.ZIPcodeInput);

    await expect(zipCodeInput).toBeVisible();
    await zipCodeInput.fill(zipCode);

    console.log(`ZIP Code entered: ${zipCode}`);
  }

  async selectAddressType(addressType: string): Promise<void> {
    const addressTypeDropdown = this.page.locator(
      AccountLocators.AddressTypeDropdown
    );

    await expect(addressTypeDropdown).toBeVisible();
    await addressTypeDropdown.selectOption({ label: addressType });

    console.log(`Address Type selected: ${addressType}`);
  }

  async enterFEIN(fein: string): Promise<void> {
    const feinInput = this.page.locator(AccountLocators.FEINInput);

    await expect(feinInput).toBeVisible();
    await feinInput.fill(fein);

    console.log('FEIN entered successfully.');
  }

  async selectProducerByCode(
    producerCode: string,
    organizationName: string,
  ): Promise<void> {
    const selectOrganizationButton = this.page.getByRole('button', {
      name: 'Select Organization...',
      exact: true,
    });

    await expect(selectOrganizationButton).toBeVisible();
    await selectOrganizationButton.click();

    await expect(
      this.page.getByRole('heading', { name: 'Organizations', exact: true }),
    ).toBeVisible();

    const producerCodeInput = this.page.getByRole('textbox', {
      name: 'Producer Code',
      exact: true,
    });
    await expect(producerCodeInput).toBeVisible();
    const producerCodeSearchTerm = producerCode.trim().split(/\s+/)[0];
    await producerCodeInput.fill(producerCodeSearchTerm);

    await this.page.getByRole('button', { name: 'Search', exact: true }).click();

    const organizationResult = this.page
      .getByRole('row')
      .filter({ hasText: organizationName });
    await expect(organizationResult).toHaveCount(1);
    await expect(organizationResult).toBeVisible();
    await organizationResult
      .getByRole('button', { name: 'Select', exact: true })
      .click();

    await expect(
      this.page.getByRole('heading', { name: 'Create account', exact: true }),
    ).toBeVisible();

    const producerCodeDropdown = this.page.getByRole('combobox', {
      name: 'Producer Code',
      exact: true,
    });
    await expect(producerCodeDropdown).toBeVisible();
    await producerCodeDropdown.selectOption({ label: producerCode });

    console.log(`Producer organization selected by code: ${producerCode}`);
  }
  async clickUpdateButton(): Promise<void> {
    const updateButton = this.page.locator(
      AccountLocators.UpdateButton
    );

    await expect(updateButton).toBeVisible();
    await updateButton.click();
    console.log('Update button clicked successfully.');

  }

  async enterCompanyAccountDetails(company: {
    Country: string;
    AddressLine1: string;
    City: string;
    County: string;
    State: string;
    PostalCode: string;
    "Address Type": string;
    FEIN: string;
    OrganizationName: string;
    "Producer Code": string;
  }): Promise<void> {

    await this.selectCountry(company.Country);
    await this.enterAddressLine1(company.AddressLine1);
    await this.enterCity(company.City);
    await this.enterCounty(company.County);
    await this.selectState(company.State);
    await this.enterZipCode(company.PostalCode);
    await this.selectAddressType(company["Address Type"]);
    await this.enterFEIN(company.FEIN);
    await this.selectProducerByCode(
      company["Producer Code"],
      company.OrganizationName,
    );
  }
  async getAccountNumber(): Promise<string> {
    const accountNumber = this.page.locator(
      AccountLocators.AccountNumber
    );

    await expect(accountNumber).toBeVisible();

    const accountNumberValue = (await accountNumber.innerText()).trim();

    if (!accountNumberValue) {
      throw new Error('Account Number was not found.');
    }

    console.log('Account Number retrieved:', accountNumberValue);

    return accountNumberValue;
  }
}
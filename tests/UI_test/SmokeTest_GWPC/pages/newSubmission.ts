import { expect, Page } from '@playwright/test';
import { newSubmissionLocators } from '../locators/newSubmissionLocators';
import { policyinfoLocators } from '../locators/policyinfoLocators';
import { GoCommercialAuto } from '../locators/GoCommercialAutoLocators';

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

  async selectEffectiveDate(): Promise<void> {
    const dateField = this.page.getByLabel(/effective date/i).first();

    if (await dateField.count()) {
      await expect(dateField).toBeVisible({ timeout: 10_000 });
      const today = new Date();
      const effectiveDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
      await dateField.fill(effectiveDate);
      console.log('Effective date entered:', effectiveDate);
      return;
    }

    const dateInput = this.page.locator('input[name*="EffectiveDate"], input[id*="EffectiveDate"]').first();
    if (await dateInput.count()) {
      await expect(dateInput).toBeVisible({ timeout: 10_000 });
      await dateInput.fill(new Date().toISOString().slice(0, 10));
      console.log('Effective date entered via fallback locator.');
      return;
    }

    console.log('Effective date field was not found; continuing without a date entry.');
  }

  async enterCommercialAutoDetails(
    details: Record<string, string>,
  ): Promise<void> {
    const encumbrancesSelect = this.page
      .locator(GoCommercialAuto.vehicleregistration)
      .locator('..');
    const encumbrancesValue =
      details[
        "With the exception of any emcumbrances, are any vehicles for which insurance is requested not solely owned by and registered to the applicant? If 'Yes' provide details"
      ];
    const insuranceDetailsValue = details['Insurance details'];

    if (!encumbrancesValue || !insuranceDetailsValue) {
      throw new Error(
        'GoCommercialAuto test data must include the encumbrances answer and Insurance details.',
      );
    }

    await expect(encumbrancesSelect).toBeVisible({ timeout: 10_000 });
    await encumbrancesSelect.selectOption({ label: encumbrancesValue });
    await expect(encumbrancesSelect.locator('option:checked')).toHaveText(
      encumbrancesValue,
    );

    const insuranceDetailsInput = this.page.locator(
      GoCommercialAuto.Insuranceetails,
    );

    await expect(insuranceDetailsInput).toBeVisible({ timeout: 10_000 });
    await insuranceDetailsInput.fill(insuranceDetailsValue);
    await expect(insuranceDetailsInput).toHaveValue(insuranceDetailsValue);

    for (const [label, value] of Object.entries(details)) {
      if (
        label ===
          "With the exception of any emcumbrances, are any vehicles for which insurance is requested not solely owned by and registered to the applicant? If 'Yes' provide details" ||
        label === 'Insurance details'
      ) {
        continue;
      }

      const namePattern = new RegExp(
        `^[^a-z0-9]*${(label.toLowerCase().match(/[a-z0-9]+/g) ?? []).join('[^a-z0-9]*')}[^a-z0-9]*$`,
        'i',
      );
      const dropdown = this.page.getByRole('combobox', {
        name: namePattern,
      });
      const textInput = this.page.getByRole('textbox', {
        name: namePattern,
      });
      const dropdownCount = await dropdown.count();
      const textInputCount = await textInput.count();

      if (dropdownCount === 1) {
        await expect(dropdown).toBeVisible({ timeout: 10_000 });
        const options = (await dropdown.locator('option').allTextContents())
          .map((option) => option.trim());
        if (!options.includes(value)) {
          throw new Error(
            `Invalid value "${value}" for Go Commercial Auto field "${label}". Available options: ${options.join(', ')}.`,
          );
        }
        await dropdown.selectOption({ label: value });
        await expect(dropdown.locator('option:checked')).toHaveText(value);
      } else if (textInputCount === 1) {
        await expect(textInput).toBeVisible({ timeout: 10_000 });
        await textInput.fill(value);
        await expect(textInput).toHaveValue(value);
      } else {
        throw new Error(
          `Expected one Go Commercial Auto control named "${label}", found ${dropdownCount} dropdown(s) and ${textInputCount} text field(s).`,
        );
      }
    }

    console.log('Commercial Auto form fields were populated and verified.');
  }
}
import { expect, Page } from '@playwright/test';
import { GoCommercialAuto } from '../locators/GoCommercialAutoLocators';

export class GoCommercialAutoPage {
  constructor(private page: Page) { }

  async enterDetails(details: Record<string, string>): Promise<void> {
    await expect(
      this.page.getByRole('main').getByRole('heading', {
        name: 'Go Commercial Auto',
        exact: true,
      }),
    ).toBeVisible({ timeout: 15_000 });

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

    console.log('Go Commercial Auto form fields were populated and verified.');
  }
}

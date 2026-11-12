import { expect, Page } from '@playwright/test';

type CoverageValue = string | boolean | number;

interface CompanyAddress {
  Name: string;
  AddressLine1: string;
  City: string;
  County: string;
  State: string;
  PostalCode: string;
  Country: string;
  'Address Type': string;
}

export class CommercialAutoCoveragesPage {
  constructor(private page: Page) { }

  async enterCoverageDetails(
    tabName: string,
    details: Record<string, CoverageValue>,
    companyAddress?: CompanyAddress,
  ): Promise<void> {
    const tab = this.page.getByRole('tab', { name: tabName, exact: true });
    const tabText = this.page.getByText(tabName, { exact: true });
    const tabLocator = (await tab.count()) === 1 ? tab : tabText;

    await expect(tabLocator).toBeVisible({ timeout: 15_000 });
    await tabLocator.click();

    for (const [label, rawValue] of Object.entries(details)) {
      const labelTokens = label.toLowerCase().match(/[a-z0-9]+/g) ?? [];
      const fieldName = new RegExp(
        labelTokens.length === 1
          ? `\\b${labelTokens[0]}\\b`
          : labelTokens.join('.*'),
        'i',
      );

      if (label === 'Name Of Lessor') {
        const scheduledItems = this.page.getByRole('group', {
          name: 'Motor Carriers - Excess Coverage For The Named Insured And Named Lessors For Leased Autos',
          exact: true,
        });
        await scheduledItems.getByRole('button', {
          name: 'Add',
          exact: true,
        }).click();

        const lessorInput = this.page.getByRole('textbox', {
          name: /lessor|name/i,
        });
        await expect(lessorInput).toBeVisible();
        const resolvedValue = resolveCoverageValue(String(rawValue));
        await lessorInput.fill(resolvedValue);
        await expect(lessorInput).toHaveValue(resolvedValue);
        continue;
      }

      if (label === 'Lessee') {
        const scheduledItems = this.page.getByRole('group', {
          name: 'Motor Carriers - Named Lessee As Insured',
          exact: true,
        });
        await scheduledItems.getByRole('button', {
          name: 'Add',
          exact: true,
        }).click();
        await scheduledItems.getByRole('button', {
          name: 'options',
          exact: true,
        }).click();
        await this.page.getByRole('menuitem', {
          name: 'New Company',
          exact: true,
        }).click();

        await expect(
          this.page.getByRole('heading', {
            name: 'New Involved Party',
            exact: true,
          }),
        ).toBeVisible({ timeout: 15_000 });
        if (!companyAddress) {
          throw new Error(
            'Account.Company address data is required to create the Lessee company.',
          );
        }

        const companyName = this.page.getByRole('textbox', {
          name: 'Name',
          exact: true,
        });
        await expect(companyName).toBeVisible();
        await companyName.fill(companyAddress.Name);
        await expect(companyName).toHaveValue(companyAddress.Name);

        await this.page.getByRole('combobox', {
          name: 'Country',
          exact: true,
        }).selectOption({ label: companyAddress.Country });
        await this.page.getByRole('textbox', {
          name: 'Address 1',
          exact: true,
        }).fill(companyAddress.AddressLine1);
        await this.page.getByRole('group', {
          name: 'City',
          exact: true,
        }).getByRole('combobox').fill(companyAddress.City);
        await this.page.getByRole('combobox', {
          name: 'County',
          exact: true,
        }).fill(companyAddress.County);
        await this.page.getByRole('combobox', {
          name: 'State',
          exact: true,
        }).selectOption({ label: companyAddress.State });
        await this.page.getByRole('combobox', {
          name: '#####-####',
          exact: true,
        }).fill(companyAddress.PostalCode);
        await this.page.getByRole('combobox', {
          name: 'Address Type',
          exact: true,
        }).selectOption({ label: companyAddress['Address Type'] });

        const saveButton = this.page.getByRole('button', {
          name: 'OK',
          exact: true,
        });
        await expect(saveButton).toBeEnabled();
        await saveButton.click();
        await expect(
          this.page.getByRole('heading', {
            name: 'Go Commercial Auto',
            exact: true,
          }),
        ).toBeVisible({ timeout: 15_000 });
        continue;
      }

      if (typeof rawValue === 'boolean') {
        const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const checkbox = this.page.getByRole('checkbox', {
          name: new RegExp(
            `^${escapedLabel}(?: visibility toggle)?$`,
          ),
        });
        await expect(
          checkbox,
          `Expected one checkbox for "${label}" on "${tabName}".`,
        ).toHaveCount(1);
        if (rawValue) {
          await checkbox.check();
        } else {
          await checkbox.uncheck();
        }
        await expect(checkbox).toBeChecked({ checked: rawValue });
        continue;
      }

      const dropdown = this.page.getByRole('combobox', { name: fieldName });
      const textInput =
        label === 'Retroactive Date'
          ? this.page
              .getByRole('group', { name: 'Retroactive Date', exact: true })
              .getByRole('textbox')
          : this.page.getByRole('textbox', { name: fieldName });
      const labelledInput = this.page.getByLabel(fieldName);
      await expect
        .poll(async () => (await dropdown.count()) + (await textInput.count()), {
          message: `Expected a rendered form control for "${label}" on "${tabName}".`,
        })
        .toBe(1);
      const dropdownCount = await dropdown.count();
      const textInputCount = await textInput.count();
      const labelledInputCount = await labelledInput.count();
      const value = String(rawValue);

      if (dropdownCount === 1 && textInputCount === 0) {
        await expect(dropdown).toBeVisible();
        if (/^Random\(\d+,\s*\d+\)$/.test(value)) {
          const options = await dropdown.locator('option').evaluateAll((items) =>
            items
              .map((option) => ({
                label: option.textContent?.trim() ?? '',
                value: (option as HTMLOptionElement).value,
              }))
              .filter((option) => option.label && option.value),
          );
          const [min, max] = value
            .slice(7, -1)
            .split(',')
            .map((bound) => Number(bound.trim()));
          if (max < min) {
            throw new Error(`Invalid random range "${value}" for "${label}".`);
          }
          const validOptions = options.filter((option) => {
            const firstAmount = option.label.match(/[\d,]+(?:\.\d+)?/);
            const amount = firstAmount
              ? Number(firstAmount[0].replace(/,/g, ''))
              : Number.NaN;
            return Number.isFinite(amount) && amount >= min && amount <= max;
          });
          if (validOptions.length === 0) {
            throw new Error(
              `No dropdown option for "${label}" falls within ${min}-${max}.`,
            );
          }
          const option =
            validOptions[Math.floor(Math.random() * validOptions.length)];
          await dropdown.selectOption(option.value);
          await expect(dropdown.locator('option:checked')).toHaveText(
            option.label,
          );
        } else {
          await dropdown.selectOption({ label: value });
          await expect(dropdown.locator('option:checked')).toHaveText(value);
        }
        continue;
      }

      if (
        dropdownCount === 0 &&
        (textInputCount === 1 || labelledInputCount === 1)
      ) {
        const input = textInputCount === 1 ? textInput : labelledInput;
        await expect(input).toBeVisible();
        const resolvedValue = resolveCoverageValue(value);
        await input.fill(resolvedValue);
        await expect(input).toHaveValue(resolvedValue);
        continue;
      }

      throw new Error(
        `Expected one input for "${label}" on "${tabName}", found ${dropdownCount} dropdown(s), ${textInputCount} text field(s), and ${labelledInputCount} labelled control(s).`,
      );
    }
  }
}

function resolveCoverageValue(value: string): string {
  if (value === 'TODAY') {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const numericRange = value.match(/^Random\((\d+),\s*(\d+)\)$/);
  if (numericRange) {
    const min = Number(numericRange[1]);
    const max = Number(numericRange[2]);
    if (max < min) {
      throw new Error(`Invalid random range "${value}".`);
    }
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }

  const stringLength = value.match(/^Random\((\d+)\)$/);
  if (stringLength) {
    const length = Number(stringLength[1]);
    if (length < 1) {
      throw new Error(`Invalid random string length "${value}".`);
    }
    return Array.from(
      { length },
      () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[
        Math.floor(Math.random() * 36)
      ],
    ).join('');
  }

  return value;
}

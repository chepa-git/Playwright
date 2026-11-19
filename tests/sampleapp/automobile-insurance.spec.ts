import { test, expect } from '../../fixtures/test-options';
import {
  INSURANT,
  VEHICLES,
  VehicleType,
  productFor,
  quoteContact,
} from '../../fixtures/sample-app-data';
import { VehicleInsurancePage } from '../../pages/sampleapp/VehicleInsurancePage';

const VEHICLE: VehicleType = 'Automobile';

const PRESENT_FIELDS = ['make', 'engineperformance', 'dateofmanufacture', 'numberofseats', 'fuel', 'listprice', 'licenseplatenumber', 'annualmileage'];
const ABSENT_FIELDS = ['model', 'cylindercapacity', 'numberofseatsmotorcycle', 'righthanddriveyes', 'payload', 'totalweight'];

test('Automobile insurance wizard shows only the Automobile vehicle fields', async ({ page }) => {
  const insurance = new VehicleInsurancePage(page);
  await insurance.open(VEHICLE);

  for (const id of PRESENT_FIELDS) await expect(insurance.field(id)).toBeVisible();
  for (const id of ABSENT_FIELDS) await expect(insurance.field(id)).toHaveCount(0);
});

test('Automobile insurance: a user can complete the wizard and send a Silver quote', async ({ page }) => {
  const insurance = new VehicleInsurancePage(page);
  await insurance.open(VEHICLE);

  await insurance.fillVehicleData(VEHICLES[VEHICLE]);
  await insurance.nextToInsurantData();
  await insurance.fillInsurantData(INSURANT);
  await insurance.nextToProductData();

  // Merit Rating and Courtesy Car are only offered for Automobile.
  const automobileOnly = productFor(VEHICLE).meritRating ? 1 : 0;
  await expect(insurance.field('meritrating')).toHaveCount(automobileOnly);
  await expect(insurance.field('courtesycar')).toHaveCount(automobileOnly);

  await insurance.fillProductData(productFor(VEHICLE));
  await insurance.nextToPriceOption();
  await insurance.expectPriceTableAvailable(true);

  // All four plans are priced, and prices rise with the level of cover.
  const prices = [
    await insurance.priceOf('Silver'),
    await insurance.priceOf('Gold'),
    await insurance.priceOf('Platinum'),
    await insurance.priceOf('Ultimate'),
  ];
  for (const price of prices) expect(price).toBeGreaterThan(0);
  expect([...prices].sort((a, b) => a - b)).toEqual(prices);

  await insurance.selectPlan('Silver');
  await insurance.nextToSendQuote();
  await insurance.fillQuoteContact(quoteContact());
  await insurance.send();

  await insurance.expectQuoteSent();
});

test('Automobile insurance: invalid vehicle data keeps the price table unavailable until corrected', async ({ page }) => {
  const insurance = new VehicleInsurancePage(page);
  await insurance.open(VEHICLE);

  // List price must be 500-100000, so 100 is rejected and the field is flagged.
  await insurance.fillVehicleData({ ...VEHICLES[VEHICLE], listPrice: '100' });
  await insurance.field('annualmileage').blur();
  await expect(page.locator('.field:has(#listprice)')).toHaveClass(/invalid/);

  await insurance.nextToInsurantData();
  await insurance.fillInsurantData(INSURANT);
  await insurance.nextToProductData();
  await insurance.fillProductData(productFor(VEHICLE));
  await insurance.field('nextselectpriceoption').click();
  await insurance.expectActiveStep('Select Price Option');
  await insurance.expectPriceTableAvailable(false);

  // Fix the list price and the price table becomes available.
  await insurance.goToStep('Enter Vehicle Data');
  await insurance.field('listprice').fill(VEHICLES[VEHICLE].listPrice);
  await insurance.nextToInsurantData();
  await insurance.nextToProductData();
  await insurance.nextToPriceOption();
  await insurance.expectPriceTableAvailable(true);
});

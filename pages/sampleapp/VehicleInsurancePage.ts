import { Page, Locator, expect } from '@playwright/test';
import {
  InsurantData,
  PricePlan,
  ProductData,
  QuoteContact,
  VehicleData,
  VehicleType,
} from '../../fixtures/sample-app-data';

const SAMPLE_APP_ORIGIN = 'https://sampleapp.tricentis.com';
const SAMPLE_APP_URL = `${SAMPLE_APP_ORIGIN}/101/app.php`;

/** Page object for the Tricentis sample "Vehicle Insurance Application" quote wizard. */
export class VehicleInsurancePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly selectedInsurance: Locator;
  readonly sendSuccessDialog: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.locator('#selectedinsurance');
    this.selectedInsurance = page.locator('#selectedinsurance');
    this.sendSuccessDialog = page.locator('.sweet-alert.visible');
  }

  field(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  /** The app picks the wizard variant from the `selectedvehicle` cookie. */
  async open(vehicle: VehicleType) {
    await this.page.context().addCookies([
      { name: 'selectedvehicle', value: vehicle, url: SAMPLE_APP_ORIGIN },
    ]);
    await this.page.goto(SAMPLE_APP_URL);
    await expect(this.selectedInsurance).toHaveText(`${vehicle} Insurance`);
  }

  // ---- Step 1: Enter Vehicle Data -------------------------------------------------

  async fillVehicleData(data: VehicleData) {
    await this.field('make').selectOption(data.make);
    if (data.model) await this.field('model').selectOption(data.model);
    if (data.cylinderCapacity) await this.field('cylindercapacity').fill(data.cylinderCapacity);
    await this.field('engineperformance').fill(data.enginePerformance);
    await this.field('dateofmanufacture').fill(data.dateOfManufacture);
    if (data.numberOfSeats) await this.field('numberofseats').selectOption(data.numberOfSeats);
    if (data.numberOfSeatsMotorcycle) {
      await this.field('numberofseatsmotorcycle').selectOption(data.numberOfSeatsMotorcycle);
    }
    if (data.rightHandDrive) await this.choose(`righthanddrive${data.rightHandDrive.toLowerCase()}`);
    if (data.fuelType) await this.field('fuel').selectOption(data.fuelType);
    if (data.payload) await this.field('payload').fill(data.payload);
    if (data.totalWeight) await this.field('totalweight').fill(data.totalWeight);
    await this.field('listprice').fill(data.listPrice);
    if (data.licensePlateNumber) {
      await this.field('licenseplatenumber').fill(data.licensePlateNumber);
    }
    await this.field('annualmileage').fill(data.annualMileage);
  }

  async nextToInsurantData() {
    await this.field('nextenterinsurantdata').click();
    await expect(this.field('firstname')).toBeVisible();
  }

  // ---- Step 2: Enter Insurant Data ------------------------------------------------

  async fillInsurantData(data: InsurantData) {
    await this.field('firstname').fill(data.firstName);
    await this.field('lastname').fill(data.lastName);
    await this.field('birthdate').fill(data.dateOfBirth);
    await this.choose(`gender${data.gender.toLowerCase()}`);
    await this.field('streetaddress').fill(data.streetAddress);
    await this.field('country').selectOption(data.country);
    await this.field('zipcode').fill(data.zipCode);
    await this.field('city').fill(data.city);
    await this.field('occupation').selectOption(data.occupation);
    for (const hobby of data.hobbies) await this.choose(hobby);
    await this.field('website').fill(data.website);
  }

  async nextToProductData() {
    await this.field('nextenterproductdata').click();
    await expect(this.field('startdate')).toBeVisible();
  }

  // ---- Step 3: Enter Product Data -------------------------------------------------

  async fillProductData(data: ProductData) {
    await this.field('startdate').fill(data.startDate);
    await this.field('insurancesum').selectOption(data.insuranceSum);
    if (data.meritRating) await this.field('meritrating').selectOption(data.meritRating);
    await this.field('damageinsurance').selectOption(data.damageInsurance);
    for (const product of data.optionalProducts) await this.choose(product);
    if (data.courtesyCar) await this.field('courtesycar').selectOption(data.courtesyCar);
  }

  async nextToPriceOption() {
    await this.field('nextselectpriceoption').click();
    await this.expectActiveStep('Select Price Option');
  }

  // ---- Step 4: Select Price Option ------------------------------------------------

  priceCell(plan: PricePlan): Locator {
    return this.field(`select${plan.toLowerCase()}_price`);
  }

  async priceOf(plan: PricePlan): Promise<number> {
    const text = (await this.priceCell(plan).innerText()).replace(/[^\d.]/g, '');
    return Number(text);
  }

  async selectPlan(plan: PricePlan) {
    await this.choose(`select${plan.toLowerCase()}`);
  }

  async nextToSendQuote() {
    await this.field('nextsendquote').click();
    await expect(this.field('email')).toBeVisible();
  }

  // ---- Step 5: Send Quote ---------------------------------------------------------

  async fillQuoteContact(data: QuoteContact) {
    await this.field('email').fill(data.email);
    await this.field('phone').fill(data.phone);
    await this.field('username').fill(data.username);
    await this.field('password').fill(data.password);
    await this.field('confirmpassword').fill(data.password);
    await this.field('Comments').fill(data.comments);
  }

  async send() {
    await this.field('sendemail').click();
  }

  async expectQuoteSent() {
    await expect(this.sendSuccessDialog).toContainText('Sending e-mail success!', {
      timeout: 30_000,
    });
  }

  // ---- Navigation / state ---------------------------------------------------------

  async expectActiveStep(name: string) {
    await expect(this.page.locator('#idealsteps-nav li.idealsteps-step-active')).toContainText(name);
  }

  /** Jump to a wizard step through the step navigation bar. */
  async goToStep(name: string) {
    await this.page.locator('#idealsteps-nav li', { hasText: name }).click();
    await this.expectActiveStep(name);
  }

  /** Step 4 hides the price table until steps 1-3 are valid and complete. */
  async expectPriceTableAvailable(available: boolean) {
    if (available) {
      await expect(this.field('pricePlans')).toBeVisible();
      await expect(this.field('xLoaderPrice')).toBeHidden();
    } else {
      await expect(this.field('xLoaderPrice')).toContainText('complete the first three steps');
      await expect(this.field('pricePlans')).toBeHidden();
    }
  }

  // ---- Helpers --------------------------------------------------------------------

  /** Radios/checkboxes are visually hidden by the form framework; click their label. */
  private async choose(id: string) {
    await this.page.locator(`label:has(#${id})`).click();
  }

  /** Runs the whole wizard up to (and including) price-option selection. */
  async completeToPriceOption(vehicle: VehicleData, insurant: InsurantData, product: ProductData) {
    await this.fillVehicleData(vehicle);
    await this.nextToInsurantData();
    await this.fillInsurantData(insurant);
    await this.nextToProductData();
    await this.fillProductData(product);
    await this.nextToPriceOption();
  }
}

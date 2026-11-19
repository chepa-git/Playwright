export type VehicleType = 'Automobile' | 'Truck' | 'Motorcycle' | 'Camper';

export interface VehicleData {
  make: string;
  model?: string; // Motorcycle only
  cylinderCapacity?: string; // Motorcycle only
  enginePerformance: string;
  dateOfManufacture: string;
  numberOfSeats?: string; // Automobile, Truck, Camper
  numberOfSeatsMotorcycle?: string; // Motorcycle only
  rightHandDrive?: 'Yes' | 'No'; // Camper only
  fuelType?: string; // not for Motorcycle
  payload?: string; // Truck, Camper
  totalWeight?: string; // Truck, Camper
  listPrice: string;
  licensePlateNumber?: string; // not for Motorcycle
  annualMileage: string;
}

export interface InsurantData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  streetAddress: string;
  country: string;
  zipCode: string;
  city: string;
  occupation: string;
  hobbies: string[]; // checkbox ids: speeding, bungeejumping, cliffdiving, skydiving, other
  website: string;
}

export interface ProductData {
  startDate: string;
  insuranceSum: string;
  meritRating?: string; // Automobile only
  damageInsurance: string;
  optionalProducts: Array<'EuroProtection' | 'LegalDefenseInsurance'>;
  courtesyCar?: string; // Automobile only
}

export interface QuoteContact {
  email: string;
  phone: string;
  username: string;
  password: string;
  comments: string;
}

export type PricePlan = 'Silver' | 'Gold' | 'Platinum' | 'Ultimate';

export const VEHICLES: Record<VehicleType, VehicleData> = {
  Automobile: {
    make: 'BMW',
    enginePerformance: '150',
    dateOfManufacture: '01/15/2020',
    numberOfSeats: '5',
    fuelType: 'Petrol',
    listPrice: '35000',
    licensePlateNumber: 'AB12CD',
    annualMileage: '15000',
  },
  Truck: {
    make: 'Volvo',
    enginePerformance: '300',
    dateOfManufacture: '03/10/2019',
    numberOfSeats: '3',
    fuelType: 'Diesel',
    payload: '800',
    totalWeight: '12000',
    listPrice: '70000',
    licensePlateNumber: 'TRK1234',
    annualMileage: '60000',
  },
  Motorcycle: {
    make: 'Honda',
    model: 'Motorcycle',
    cylinderCapacity: '1000',
    enginePerformance: '90',
    dateOfManufacture: '06/20/2021',
    numberOfSeatsMotorcycle: '2',
    listPrice: '12000',
    annualMileage: '8000',
  },
  Camper: {
    make: 'Mercedes Benz',
    enginePerformance: '120',
    dateOfManufacture: '09/05/2018',
    numberOfSeats: '4',
    rightHandDrive: 'No',
    fuelType: 'Diesel',
    payload: '600',
    totalWeight: '3500',
    listPrice: '80000',
    licensePlateNumber: 'CMP5678',
    annualMileage: '12000',
  },
};

export const INSURANT: InsurantData = {
  firstName: 'Jane',
  lastName: 'Tester',
  dateOfBirth: '03/15/1985',
  gender: 'Female',
  streetAddress: '12 Test Street',
  country: 'Germany',
  zipCode: '10115',
  city: 'Berlin',
  occupation: 'Employee',
  hobbies: ['speeding', 'skydiving'],
  website: 'https://www.tricentis.com',
};

/** Start date must be more than one month ahead; use ~2 months in MM/DD/YYYY. */
export function futureStartDate(monthsAhead = 2): string {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsAhead);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}

export function productFor(vehicle: VehicleType): ProductData {
  const base: ProductData = {
    startDate: futureStartDate(),
    insuranceSum: '7000000',
    damageInsurance: 'Full Coverage',
    optionalProducts: ['EuroProtection', 'LegalDefenseInsurance'],
  };
  // Merit Rating and Courtesy Car exist only for Automobile.
  if (vehicle === 'Automobile') {
    base.meritRating = 'Bonus 1';
    base.courtesyCar = 'Yes';
  }
  return base;
}

export function quoteContact(): QuoteContact {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    email: `pw.${suffix}@example.com`,
    phone: '5551234567',
    username: `pwuser${suffix}`.slice(0, 20),
    password: 'Passw0rdTest1',
    comments: 'Automated Playwright quote request',
  };
}

import type { ServiceTicket, Customer, Product } from '@/types';

// Default objects for fallbacks
const defaultCustomer: Customer = {
  id: 'default',
  name: 'Default Customer',
  email: 'default@example.com',
  phone: '000-000-0000',
  marketingConsent: false,
  createdAt: '2023-01-01T00:00:00Z'
};

const defaultProduct: Product = {
  id: 'default',
  name: 'Default Product',
  category: 'Other',
  price: 0,
  createdAt: '2023-01-01T00:00:00Z'
};

// Mock customers
const customers: Customer[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '123-456-7890',
    marketingConsent: true,
    createdAt: '2023-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '234-567-8901',
    marketingConsent: false,
    createdAt: '2023-02-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    phone: '345-678-9012',
    marketingConsent: true,
    createdAt: '2023-03-05T09:15:00Z'
  }
];

// Mock products
const products: Product[] = [
  {
    id: '1',
    name: 'Bike Chain',
    category: 'Parts',
    barcode: 'BC-12345',
    price: 25.99,
    description: 'High-quality bike chain',
    createdAt: '2023-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Wheel Bearings',
    category: 'Parts',
    barcode: 'WB-67890',
    price: 15.50,
    description: 'Smooth rolling wheel bearings',
    createdAt: '2023-01-01T00:00:00Z'
  }
];

// Mock service tickets
const serviceTickets: ServiceTicket[] = [
  {
    id: '1',
    customerId: '1',
    customer: customers[0] || { ...defaultCustomer, id: '1' },
    equipmentBrand: 'Trek',
    serviceType: 'Full Service',
    recipient: 'Self',
    additionalDetails: 'Bike is making a clicking noise when pedaling',
    status: 'todo',
    createdAt: '2023-05-01T10:30:00Z',
    updatedAt: '2023-05-01T10:30:00Z'
  },
  {
    id: '2',
    customerId: '2',
    customer: customers[1] || { ...defaultCustomer, id: '2' },
    equipmentBrand: 'Specialized',
    serviceType: 'Simple Service',
    recipient: 'Gift',
    additionalDetails: 'Brakes need adjustment, gears slipping',
    status: 'in-progress',
    createdAt: '2023-05-02T14:00:00Z',
    updatedAt: '2023-05-03T09:15:00Z',
    mechanicId: 'M1'
  },
  {
    id: '3',
    customerId: '3',
    customer: customers[2] || { ...defaultCustomer, id: '3' },
    equipmentBrand: 'Giant',
    serviceType: 'Other',
    recipient: 'Self',
    additionalDetails: 'Wheel truing and new tires installation',
    status: 'waiting-for-parts',
    createdAt: '2023-05-04T11:30:00Z',
    updatedAt: '2023-05-05T13:45:00Z',
    partsUsed: [products[0] || { ...defaultProduct, id: '1' }]
  },
  {
    id: '4',
    customerId: '1',
    customer: customers[0] || { ...defaultCustomer, id: '1' },
    equipmentBrand: 'Cannondale',
    serviceType: 'Full Service',
    recipient: 'Self',
    additionalDetails: 'Annual maintenance',
    status: 'done',
    createdAt: '2023-04-15T09:00:00Z',
    updatedAt: '2023-04-18T16:30:00Z',
    completionDate: '2023-04-18T16:30:00Z',
    totalCost: 120.50,
    mechanicId: 'M2',
    partsUsed: [
      products[0] || { ...defaultProduct, id: '1' }, 
      products[1] || { ...defaultProduct, id: '2' }
    ]
  },
  {
    id: '5',
    customerId: '2',
    customer: customers[1] || { ...defaultCustomer, id: '2' },
    equipmentBrand: 'Cervelo',
    serviceType: 'Simple Service',
    recipient: 'Self',
    additionalDetails: 'Derailleur adjustment',
    status: 'todo',
    createdAt: '2023-05-06T13:15:00Z',
    updatedAt: '2023-05-06T13:15:00Z'
  }
];

export { customers, products, serviceTickets }; 
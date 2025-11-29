import { Customer, Order, OrderStatus, GarmentType } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: 'Aisha Khan',
    phone: '+1234567890',
    email: 'aisha@example.com',
    totalOrders: 5,
    lastVisit: '2023-10-15',
    savedMeasurements: {
      [GarmentType.KURTA]: [
        { label: 'Length', value: 42, unit: 'in' },
        { label: 'Chest', value: 36, unit: 'in' },
        { label: 'Waist', value: 32, unit: 'in' },
        { label: 'Sleeve', value: 20, unit: 'in' },
      ]
    }
  },
  {
    id: 'c2',
    name: 'Rahul Sharma',
    phone: '+1987654321',
    totalOrders: 2,
    lastVisit: '2023-10-20',
    savedMeasurements: {
      [GarmentType.SUIT_2PC]: [
        { label: 'Shoulder', value: 18, unit: 'in' },
        { label: 'Chest', value: 40, unit: 'in' },
        { label: 'Sleeve', value: 25, unit: 'in' },
        { label: 'Pant Length', value: 40, unit: 'in' },
        { label: 'Waist', value: 34, unit: 'in' },
      ]
    }
  },
  {
    id: 'c3',
    name: 'Sarah Jenkins',
    phone: '+1122334455',
    totalOrders: 8,
    lastVisit: '2023-10-25',
    savedMeasurements: {}
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'o101',
    customerId: 'c1',
    customerName: 'Aisha Khan',
    garmentType: GarmentType.KURTA,
    description: 'Black silk kurta with gold piping',
    measurements: MOCK_CUSTOMERS[0].savedMeasurements[GarmentType.KURTA],
    status: OrderStatus.COMPLETED,
    orderDate: '2023-10-01',
    dueDate: '2023-10-05',
    price: 1500,
    advance: 1500,
    isUrgent: false,
    assignedStaff: 'Master Ali'
  },
  {
    id: 'o102',
    customerId: 'c1',
    customerName: 'Aisha Khan',
    garmentType: GarmentType.LEHENGA,
    description: 'Bridal alteration, heavy embroidery care needed.',
    measurements: [],
    status: OrderStatus.STITCHING,
    orderDate: '2023-10-15',
    dueDate: '2023-11-01',
    price: 5000,
    advance: 2000,
    isUrgent: true,
    assignedStaff: 'Sarah Stitch'
  },
  {
    id: 'o103',
    customerId: 'c2',
    customerName: 'Rahul Sharma',
    garmentType: GarmentType.SUIT_2PC,
    description: 'Navy blue business suit. Slim fit.',
    measurements: MOCK_CUSTOMERS[1].savedMeasurements[GarmentType.SUIT_2PC],
    status: OrderStatus.TRIAL_READY,
    orderDate: '2023-10-20',
    dueDate: '2023-10-28',
    price: 8500,
    advance: 4000,
    isUrgent: false,
    assignedStaff: 'Master Ali'
  },
  {
    id: 'o104',
    customerId: 'c3',
    customerName: 'Sarah Jenkins',
    garmentType: GarmentType.BLOUSE,
    description: 'Designer blouse with back tassels.',
    measurements: [],
    status: OrderStatus.RECEIVED,
    orderDate: '2023-10-26',
    dueDate: '2023-11-05',
    price: 1200,
    advance: 0,
    isUrgent: false,
  },
  {
    id: 'o105',
    customerId: 'c2',
    customerName: 'Rahul Sharma',
    garmentType: GarmentType.SHIRT,
    description: 'White linen shirt.',
    measurements: [],
    status: OrderStatus.CUTTING,
    orderDate: '2023-10-27',
    dueDate: '2023-10-30',
    price: 1800,
    advance: 1800,
    isUrgent: true,
  }
];
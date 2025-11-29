import { User, Order, Customer } from '../types';
import { MOCK_ORDERS, MOCK_CUSTOMERS } from './mockData';

// Helper to simulate delay for mock mode
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class ApiService {
  private scriptUrl: string | null = null;
  private mockUser: User = { id: 'demo1', name: 'Demo User', email: 'demo@tailorflow.com', role: 'admin' };

  constructor() {
    this.scriptUrl = localStorage.getItem('TAILORFLOW_SCRIPT_URL');
  }

  setScriptUrl(url: string) {
    this.scriptUrl = url;
    localStorage.setItem('TAILORFLOW_SCRIPT_URL', url);
  }

  getScriptUrl() {
    return this.scriptUrl;
  }

  private async callScript(action: string, payload: any = {}) {
    if (!this.scriptUrl) {
      throw new Error("Script URL not configured");
    }

    // Google Apps Script requires text/plain to avoid CORS preflight complex checks sometimes, 
    // but standard JSON usually works if GAS is deployed as "Anyone".
    const response = await fetch(this.scriptUrl, {
      method: 'POST',
      body: JSON.stringify({ action, payload }),
    });

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error);
    }
    return json;
  }

  // AUTH
  async login(email: string, password: string): Promise<User> {
    if (!this.scriptUrl) {
      await delay(800);
      if (email === 'demo@tailor.com' && password === 'demo') {
        return this.mockUser;
      }
      throw new Error('Invalid credentials (Try demo@tailor.com / demo)');
    }

    const result = await this.callScript('login', { email, password });
    return result.user;
  }

  async signup(name: string, email: string, password: string): Promise<User> {
    if (!this.scriptUrl) {
      await delay(800);
      return { ...this.mockUser, name, email };
    }

    const result = await this.callScript('signup', { name, email, password });
    return result.user;
  }

  // DATA
  async getOrders(): Promise<Order[]> {
    if (!this.scriptUrl) {
      await delay(500);
      return [...MOCK_ORDERS];
    }
    const result = await this.callScript('getOrders');
    return result.data || [];
  }

  async createOrder(order: Order): Promise<Order> {
    if (!this.scriptUrl) {
      await delay(500);
      MOCK_ORDERS.unshift(order);
      return order;
    }
    await this.callScript('createOrder', order);
    return order;
  }

  async updateOrder(order: Order): Promise<void> {
    if (!this.scriptUrl) {
      const idx = MOCK_ORDERS.findIndex(o => o.id === order.id);
      if (idx !== -1) MOCK_ORDERS[idx] = order;
      return;
    }
    await this.callScript('updateOrder', order);
  }

  async getCustomers(): Promise<Customer[]> {
    if (!this.scriptUrl) {
      await delay(500);
      return [...MOCK_CUSTOMERS];
    }
    const result = await this.callScript('getCustomers');
    return result.data || [];
  }

  async createCustomer(customer: Customer): Promise<Customer> {
    if (!this.scriptUrl) {
      await delay(500);
      MOCK_CUSTOMERS.push(customer);
      return customer;
    }
    await this.callScript('createCustomer', customer);
    return customer;
  }
}

export const api = new ApiService();

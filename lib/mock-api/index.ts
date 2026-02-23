import { Category, MenuItem, Order, OrderStatus, Promotion, Settings, Table } from '../types';
import {
  mockSettings,
  mockCategories,
  mockMenuItems,
  mockPromotions,
  mockTables,
  mockOrders,
} from '../mock-data';

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockAPI {
  private settingsData: Settings = { ...mockSettings };
  private categoriesData: Category[] = [...mockCategories];
  private menuItemsData: MenuItem[] = [...mockMenuItems];
  private promotionsData: Promotion[] = [...mockPromotions];
  private tablesData: Table[] = [...mockTables];
  private ordersData: Order[] = [...mockOrders];
  private queueCounter: number = 10;

  /**
   * Settings API
   */
  settings = {
    get: async (): Promise<Settings> => {
      await delay(100);
      return { ...this.settingsData };
    },
    update: async (updates: Partial<Settings>): Promise<Settings> => {
      await delay(200);
      this.settingsData = { ...this.settingsData, ...updates, updated_at: new Date().toISOString() };
      return { ...this.settingsData };
    },
  };

  /**
   * Categories API
   */
  categories = {
    getAll: async (): Promise<Category[]> => {
      await delay(100);
      return [...this.categoriesData];
    },
    getById: async (id: string): Promise<Category | null> => {
      await delay(50);
      return this.categoriesData.find((c) => c.id === id) || null;
    },
    create: async (data: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> => {
      await delay(200);
      const newCategory: Category = {
        ...data,
        id: `cat-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.categoriesData.push(newCategory);
      return newCategory;
    },
    update: async (id: string, updates: Partial<Category>): Promise<Category | null> => {
      await delay(200);
      const index = this.categoriesData.findIndex((c) => c.id === id);
      if (index === -1) return null;
      this.categoriesData[index] = {
        ...this.categoriesData[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...this.categoriesData[index] };
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(200);
      const index = this.categoriesData.findIndex((c) => c.id === id);
      if (index === -1) return false;
      this.categoriesData.splice(index, 1);
      return true;
    },
  };

  /**
   * Menu Items API
   */
  menuItems = {
    getAll: async (): Promise<MenuItem[]> => {
      await delay(100);
      return [...this.menuItemsData];
    },
    getById: async (id: string): Promise<MenuItem | null> => {
      await delay(50);
      return this.menuItemsData.find((m) => m.id === id) || null;
    },
    getByCategoryId: async (categoryId: string): Promise<MenuItem[]> => {
      await delay(100);
      return this.menuItemsData.filter((m) => m.category_id === categoryId);
    },
    create: async (data: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> => {
      await delay(200);
      const newMenuItem: MenuItem = {
        ...data,
        id: `item-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.menuItemsData.push(newMenuItem);
      return newMenuItem;
    },
    update: async (id: string, updates: Partial<MenuItem>): Promise<MenuItem | null> => {
      await delay(200);
      const index = this.menuItemsData.findIndex((m) => m.id === id);
      if (index === -1) return null;
      this.menuItemsData[index] = {
        ...this.menuItemsData[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...this.menuItemsData[index] };
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(200);
      const index = this.menuItemsData.findIndex((m) => m.id === id);
      if (index === -1) return false;
      this.menuItemsData.splice(index, 1);
      return true;
    },
  };

  /**
   * Promotions API
   */
  promotions = {
    getAll: async (): Promise<Promotion[]> => {
      await delay(100);
      return [...this.promotionsData];
    },
    getActive: async (): Promise<Promotion[]> => {
      await delay(100);
      const now = new Date().toISOString();
      return this.promotionsData.filter(
        (p) => p.is_active && p.start_date <= now && p.end_date >= now
      );
    },
    getById: async (id: string): Promise<Promotion | null> => {
      await delay(50);
      return this.promotionsData.find((p) => p.id === id) || null;
    },
    create: async (
      data: Omit<Promotion, 'id' | 'created_at' | 'updated_at'>
    ): Promise<Promotion> => {
      await delay(200);
      const newPromotion: Promotion = {
        ...data,
        id: `promo-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.promotionsData.push(newPromotion);
      return newPromotion;
    },
    update: async (id: string, updates: Partial<Promotion>): Promise<Promotion | null> => {
      await delay(200);
      const index = this.promotionsData.findIndex((p) => p.id === id);
      if (index === -1) return null;
      this.promotionsData[index] = {
        ...this.promotionsData[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...this.promotionsData[index] };
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(200);
      const index = this.promotionsData.findIndex((p) => p.id === id);
      if (index === -1) return false;
      this.promotionsData.splice(index, 1);
      return true;
    },
  };

  /**
   * Tables API
   */
  tables = {
    getAll: async (): Promise<Table[]> => {
      await delay(100);
      return [...this.tablesData];
    },
    getById: async (id: string): Promise<Table | null> => {
      await delay(50);
      return this.tablesData.find((t) => t.id === id) || null;
    },
    getByTableNumber: async (tableNumber: string): Promise<Table | null> => {
      await delay(50);
      return this.tablesData.find((t) => t.table_number === tableNumber) || null;
    },
    create: async (data: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> => {
      await delay(200);
      const newTable: Table = {
        ...data,
        id: `table-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.tablesData.push(newTable);
      return newTable;
    },
    update: async (id: string, updates: Partial<Table>): Promise<Table | null> => {
      await delay(200);
      const index = this.tablesData.findIndex((t) => t.id === id);
      if (index === -1) return null;
      this.tablesData[index] = {
        ...this.tablesData[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...this.tablesData[index] };
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(200);
      const index = this.tablesData.findIndex((t) => t.id === id);
      if (index === -1) return false;
      this.tablesData.splice(index, 1);
      return true;
    },
  };

  /**
   * Orders API
   */
  orders = {
    getAll: async (): Promise<Order[]> => {
      await delay(150);
      return [...this.ordersData];
    },
    getById: async (id: string): Promise<Order | null> => {
      await delay(100);
      return this.ordersData.find((o) => o.id === id) || null;
    },
    getByStatus: async (status: OrderStatus): Promise<Order[]> => {
      await delay(100);
      return this.ordersData.filter((o) => o.status === status);
    },
    getByTableId: async (tableId: string): Promise<Order[]> => {
      await delay(100);
      return this.ordersData.filter((o) => o.table_id === tableId);
    },
    getByTableNumber: async (tableNumber: string): Promise<Order[]> => {
      await delay(100);
      return this.ordersData.filter((o) => o.table_number === tableNumber);
    },
    create: async (data: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> => {
      await delay(200);
      const orderNumber = `#${String(this.ordersData.length + 1).padStart(3, '0')}`;
      const newOrder: Order = {
        ...data,
        id: `order-${Date.now()}`,
        order_number: orderNumber,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.ordersData.push(newOrder);
      return newOrder;
    },
    updateStatus: async (id: string, status: OrderStatus): Promise<Order | null> => {
      await delay(200);
      const index = this.ordersData.findIndex((o) => o.id === id);
      if (index === -1) return null;
      this.ordersData[index] = {
        ...this.ordersData[index],
        status,
        updated_at: new Date().toISOString(),
      };
      return { ...this.ordersData[index] };
    },
    update: async (id: string, updates: Partial<Order>): Promise<Order | null> => {
      await delay(200);
      const index = this.ordersData.findIndex((o) => o.id === id);
      if (index === -1) return null;
      this.ordersData[index] = {
        ...this.ordersData[index],
        ...updates,
        updated_at: new Date().toISOString(),
      };
      return { ...this.ordersData[index] };
    },
    delete: async (id: string): Promise<boolean> => {
      await delay(200);
      const index = this.ordersData.findIndex((o) => o.id === id);
      if (index === -1) return false;
      this.ordersData.splice(index, 1);
      return true;
    },
  };

  /**
   * Queue API
   */
  queue = {
    getNextQueueNumber: async (): Promise<number> => {
      await delay(50);
      return ++this.queueCounter;
    },
    getQueueByNumber: async (queueNumber: number): Promise<Order | null> => {
      await delay(100);
      return this.ordersData.find((o) => o.queue_number === queueNumber) || null;
    },
    getAllQueue: async (): Promise<Order[]> => {
      await delay(100);
      return this.ordersData.filter((o) => o.queue_number !== undefined);
    },
    getActiveQueue: async (): Promise<Order[]> => {
      await delay(100);
      return this.ordersData.filter(
        (o) =>
          o.queue_number !== undefined &&
          (o.status === 'pending' || o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready')
      );
    },
    createWalkInQueue: async (data: {
      customer_name?: string;
      customer_phone?: string;
    }): Promise<Order> => {
      await delay(200);

      const queueNumber = await this.queue.getNextQueueNumber();
      const orderId = `order-${Date.now()}`;
      const orderNumber = `Q${String(queueNumber).padStart(3, '0')}-${Date.now().toString().slice(-6)}`;

      const newOrder: Order = {
        id: orderId,
        order_number: orderNumber,
        customer_name: data.customer_name || 'Walk-in Customer',
        customer_phone: data.customer_phone,
        status: 'pending',
        items: [], // No menu items for walk-in queue
        total_amount: 0, // Free queue
        mode: 'market',
        queue_number: queueNumber,
        tracking_url: `/queue/${orderId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.ordersData.push(newOrder);
      return newOrder;
    },
  };
}

// Export singleton instance
export const mockAPI = new MockAPI();

// Export type-safe API functions
export const api = {
  settings: mockAPI.settings,
  categories: mockAPI.categories,
  menuItems: mockAPI.menuItems,
  promotions: mockAPI.promotions,
  tables: mockAPI.tables,
  orders: mockAPI.orders,
  queue: mockAPI.queue,
};

export default api;

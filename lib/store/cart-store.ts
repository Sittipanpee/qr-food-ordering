import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, MenuItem } from '@/lib/types';

interface CartStore {
  items: CartItem[];
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (menuItem, quantity = 1, notes = '') => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.menu_item.id === menuItem.id
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.menu_item.id === menuItem.id
                  ? { ...item, quantity: item.quantity + quantity, notes }
                  : item
              ),
            };
          }

          return {
            items: [...state.items, { menu_item: menuItem, quantity, notes }],
          };
        });
      },

      removeItem: (menuItemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.menu_item.id !== menuItemId),
        }));
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.menu_item.id === menuItemId ? { ...item, quantity } : item
          ),
        }));
      },

      updateNotes: (menuItemId, notes) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menu_item.id === menuItemId ? { ...item, notes } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce(
          (total, item) => total + item.menu_item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

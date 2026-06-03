import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        const { cartItems } = get();
        const qty = product.quantity ?? 1;
        const existing = cartItems.find((item) => item.id === product.id);
        if (existing) {
          set({
            cartItems: cartItems.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity: qty }] });
        }
      },

      // Sets exact quantity — used by Buy Now so it doesn't double-stack
      buyNow: (product, quantity) => {
        const { cartItems } = get();
        const existing = cartItems.find((item) => item.id === product.id);
        if (existing) {
          set({
            cartItems: cartItems.map((item) =>
              item.id === product.id ? { ...item, quantity } : item
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity }] });
        }
      },

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== productId),
        })),

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),
    }),
    { name: 'anchorsoft-cart' }
  )
);

export const selectCartCount = (state) =>
  state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default useCartStore;

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (product) => {
        const { cartItems } = get();
        const qty      = product.quantity || 1;
        const maxStock = product.stock || Infinity;
        const existing = cartItems.find((i) => i.id === product.id);
        if (existing) {
          const newQty = Math.min(existing.quantity + qty, maxStock);
          set({
            cartItems: cartItems.map((i) =>
              i.id === product.id ? { ...i, quantity: newQty } : i
            ),
          });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity: Math.min(qty, maxStock) }] });
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

      updateQuantity: (productId, newQuantity, maxStock = Infinity) => {
        if (newQuantity < 1) {
          get().removeFromCart(productId);
          return;
        }
        const safeQty = Math.max(1, Math.min(newQuantity, maxStock));
        if (newQuantity > maxStock) {
          toast.error(`Only ${maxStock} unit${maxStock !== 1 ? 's' : ''} available`);
        }
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === productId ? { ...item, quantity: safeQty } : item
          ),
        }));
      },

      clearCart: () => set({ cartItems: [] }),
    }),
    {
      name: 'anchorsoft-cart',
      version: 2,
      migrate: (persistedState, version) => {
        return { cartItems: [] };
      },
    }
  )
);

export const selectCartCount = (state) =>
  state.cartItems.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state) =>
  state.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default useCartStore;

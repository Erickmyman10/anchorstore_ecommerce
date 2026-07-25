import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWalletStore = create(
  persist(
    (set, get) => ({
      balance: 0,
      transactions: [],

      deduct: (amount) => {
        const { balance } = get();
        if (amount > balance) throw new Error('Insufficient wallet balance.');
        set((s) => ({
          balance: Math.round(s.balance - amount),
          transactions: [
            { id: Date.now(), type: 'payment', amount: -Math.round(amount), date: new Date().toISOString() },
            ...s.transactions,
          ],
        }));
      },

      topUp: (amount) => {
        if (amount <= 0) return;
        set((s) => ({
          balance: Math.round(s.balance + amount),
          transactions: [
            { id: Date.now(), type: 'topup', amount: Math.round(amount), date: new Date().toISOString() },
            ...s.transactions,
          ],
        }));
      },
    }),
    { name: 'anchorsoft-wallet', version: 2 }
  )
);

export default useWalletStore;

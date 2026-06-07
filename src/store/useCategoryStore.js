import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCategoryStore = create(
  persist(
    (set) => ({
      selectedCategory: 'all',
      setCategory: (category) => set({ selectedCategory: category }),
      resetCategory: () => set({ selectedCategory: 'all' }),
    }),
    { name: 'anchorsoft-category' }
  )
);

export default useCategoryStore;

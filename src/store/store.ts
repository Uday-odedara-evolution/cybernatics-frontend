import { UserStore, LocationStore, DepartmentStore, PremiumStoreType } from '@/interface';
import { create } from 'zustand';

export const useUser = create<UserStore>((set) => ({
  user: null,
  setUser: (newUser) => set({ user: newUser })
}));

export const useLocation = create<LocationStore>((set) => ({
  locations: [],
  setLocation: (val) => set({ locations: val })
}));

export const useDepartment = create<DepartmentStore>((set) => ({
  departments: [],
  setDepartments: (val) => set({ departments: val })
}));

export const usePremium = create<PremiumStoreType>((set) => ({
  isPremium: false,
  subscription: null,
  planDetails: null,
  setIsPremium: (val) => set({ isPremium: val }),
  setSubscription: (val) => set({ subscription: val }),
  setPlanDetails: (val) => set({ planDetails: val })
}));

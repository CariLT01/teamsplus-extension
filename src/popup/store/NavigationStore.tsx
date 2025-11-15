import { create } from "zustand";

interface NavigationStore {
    location: string;
    setLocation: (newLocation: string) => void;
}

export const useNavigationStore = create<NavigationStore>((set) => ({
    location: "",
    setLocation: (newLocation: string) => {
        set({location: newLocation})
    }
}))
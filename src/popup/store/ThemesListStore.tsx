import { create } from "zustand";
import { dataManagementService } from "../services/DataManagementService";

interface ThemesListStore {
    themes: {[key: string]: string},
    setThemesList: (themes: {[key: string]: string}) => void;
}

export const useThemesListStore = create<ThemesListStore>((set) => ({
    themes: dataManagementService.getThemes(),
    setThemesList: (themes: {[key: string]: string}) => {
        set({themes: themes})
    }
}))
import { DataManager } from "../../dataManagement";
import { useThemesListStore } from "../store/ThemesListStore";

class DataManagementService {
    private dataManager: DataManager;

    constructor() {
        this.dataManager = new DataManager();

        this.dataManager.loadAll();

    }


    getThemes() {
        return this.dataManager.currentThemes;
    }

}

export const dataManagementService = new DataManagementService();
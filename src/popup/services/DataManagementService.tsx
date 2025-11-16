import { DataManager, ThemeData } from "../../dataManagement";
import { useThemesListStore } from "../store/ThemesListStore";

class DataManagementService {
    public dataManager: DataManager;
    private subscribers: (() => void)[] = [];

    constructor() {
        this.dataManager = new DataManager();

        this.loadData();
    }

    async loadData() {
        await this.dataManager.loadAll();
        this.dataUpdated();
    }

    onChange(cb: () => void) {
        this.subscribers.push(cb);
    }


    getThemes() {
        return this.dataManager.currentThemes;
    }

    getData() {
        return this.dataManager.currentData;
    }

    dataUpdated() {
        console.log("Data updated, notifying subscribers");
        for (const cb of this.subscribers) {
            cb();
        }

        // Save
        this.dataManager.saveData();
    }

}

export const dataManagementService = new DataManagementService();
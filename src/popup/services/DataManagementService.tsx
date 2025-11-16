import { DataManager, ThemeData } from "../../dataManagement";
import { useThemesListStore } from "../store/ThemesListStore";
import { ThemeManager } from "../themes";

class DataManagementService {
    public dataManager: DataManager;
    public themeManager: ThemeManager;
    private subscribers: (() => void)[] = [];
    private subscribersThemes: (() => void)[] = [];

    constructor() {
        this.dataManager = new DataManager();
        this.themeManager = new ThemeManager(this.dataManager);

        this.loadData();
    }

    async loadData() {
        await this.dataManager.loadAll();
        this.dataUpdated();
        this.themesUpdated();
    }

    onChange(cb: () => void) {
        this.subscribers.push(cb);
    }

    onChangeThemes(cb: () => void) {
        this.subscribersThemes.push(cb);
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
    themesUpdated() {
        console.log("Themes updated, notifying subscribers");
        for (const cb of this.subscribersThemes) {
            cb();
        }

        this.dataManager.saveThemes();
    }

}

export const dataManagementService = new DataManagementService();
import { RuntimeStyles } from "./styles";
import { DataManager } from "../dataManagement";
import { ExtensionStorageProvider } from "../storage/ExtensionStorageProvider";

export class RealtimeUpdatesManager {
    stylesRuntime: InstanceType<typeof RuntimeStyles>;
    dataManager: InstanceType<typeof DataManager>

    constructor(dataManager: InstanceType<typeof DataManager>, stylesRuntime: InstanceType<typeof RuntimeStyles>) {
        this.stylesRuntime = stylesRuntime;
        this.dataManager = dataManager;
    }

    detectChange() {
        console.log("start change detect")

        ExtensionStorageProvider.registerChangeListener(async (key: string) => {
            if (key != "themeData") return;
            console.log("Change detected!");
            await this.dataManager.loadAll();
            this.stylesRuntime.deleteStyle();
            this.stylesRuntime.applyBackgrounds();
            this.stylesRuntime.applyColors();
            this.stylesRuntime.applyFonts(null);
        });

    }
}
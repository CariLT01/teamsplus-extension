import { RuntimeStyles } from "./styles";
import { DataManager } from "../dataManagement";

export class RealtimeUpdatesManager {
    stylesRuntime: InstanceType<typeof RuntimeStyles>;
    dataManager: InstanceType<typeof DataManager>

    constructor(dataManager: InstanceType<typeof DataManager>, stylesRuntime: InstanceType<typeof RuntimeStyles>){
        this.stylesRuntime = stylesRuntime;
        this.dataManager = dataManager;
    }

    detectChange() {
        console.log("start change detect")
        chrome.storage.onChanged.addListener(async (changes, areaName) => {
            if (areaName === 'local') {  // 'sync' refers to chrome.storage.sync
                // Loop through the changed items
                for (let key in changes) {
                    if (changes.hasOwnProperty(key)) {
                        if (key == "themeData") {
                            console.log("Change detected!");
                            await this.dataManager.loadAll();
                            this.stylesRuntime.deleteStyle();
                            this.stylesRuntime.applyBackgrounds();
                            this.stylesRuntime.applyColors();
                            this.stylesRuntime.applyFonts(null);
                        }
                    }
                }
            }
        });
    
    }
}
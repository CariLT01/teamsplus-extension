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
                        if (key == "colors") {
                            console.log("Change detected!");
                            await this.dataManager.loadColors();
                            this.stylesRuntime.deleteStyle();
                            this.stylesRuntime.applyColors();
                        }
                        if (key == "fonts") {
                            console.log("Change detected fonts");
                            await this.dataManager.loadFonts();
                            this.stylesRuntime.deleteFontsStyle();
                            this.stylesRuntime.applyFonts(null);
                        }
                        if (key == "classColors") {
                            console.log("Change detected classes");
                            await this.dataManager.loadClassColors();
                            this.stylesRuntime.deleteStyle();
                            this.stylesRuntime.applyColors();
                        }
                        if (key == "pixelValues") {
                            console.log("Change detected pixel values");
                            await this.dataManager.loadPixelValues();
                            this.stylesRuntime.deleteStyle();
                            this.stylesRuntime.applyColors();
                        }
                        if (key == "backgrounds") {
                            console.log("Change detected backgrounds");
                            await this.dataManager.loadBackgrounds();
                            this.stylesRuntime.applyBackgrounds();
                        }
                    }
                }
            }
        });
    
    }
}
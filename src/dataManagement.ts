import { DEFAULT_PIXEL_VALUES, DEFAULT_COLORS, CLASS_COLORS, DEFAULT_FONTS, DEFAULT_BACKGROUNDS, DEFAULT_EMOJIS } from "./shared";
import { DEFAULT_THEMES } from "./contribution/defaultThemes";

async function p_basicDataLoad(key: string): Promise<ThemeData | undefined> {
    const result = (await chrome.storage.local.get([key]))[key];
    if (result == null) {
        console.log("Nothing with basic key loaded: ", key);
        return;
    }
    console.log("loaded key");
    return result;
}

async function p_basicDataLoad2(key: string): Promise<{ [key: string]: string } | undefined> {
    const result = (await chrome.storage.local.get([key]))[key];
    if (result == null) {
        console.log("Nothing with basic key loaded: ", key);
        return;
    }
    console.log("loaded key");
    return result;
}

async function p_basicDataLoadGeneric<T>(key: string): Promise<T | undefined> {
    const result = (await chrome.storage.local.get([key]))[key] as T | undefined;

    if (result == null) {
        console.log("Nothing with basic key loaded:", key);
        return undefined;
    }

    console.log("loaded key");
    return result;
}

function p_basicDataRepair(data: { [key: string]: string } | undefined, defaults: { [key: string]: string }): { [key: string]: string } {
    //console.log(data);
    //console.log(defaults);

    if (data == undefined) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    if (data == null) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }

    data = JSON.parse(JSON.stringify(data));


    if (data == undefined) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    if (data == null) {
        console.warn("Data is undefined. Returning defaults");
        return defaults;
    }
    console.log("List: ", data);
    console.log("Defaults: ", defaults);

    const result = {...defaults};

    for (const property in defaults) {
        if (data[property] !== undefined) {
            result[property] = data[property];
        } else {
            //console.log(`Property "${property}" missing/undefined, using default`, data[property], " where property is: ", property, " and data is: ", data);
            console.log("Property ", property, " is missing");
        }
    }

    return result;
}

///////// Functions for storing / loading fonts ////////
export type ThemeKeys = "colors" | "classColors" | "fonts" | "pixelValues" | "backgrounds" | "emojis";
export const ThemeKeysList = ["colors", "classColors", "fonts", "pixelValues", "backgrounds", "emojis"];
export type ThemeData = { [K in ThemeKeys]: { [key: string]: string } };
export type ThemeDataDefaults = { [K in ThemeKeys]: { [key: string]: string } }

export type SettingsData = {
    teamsNameMappings: {[key: string]: string}
}

const DEFAULT_DATA: ThemeDataDefaults = {
    colors: DEFAULT_COLORS,
    classColors: CLASS_COLORS,
    fonts: DEFAULT_FONTS,
    pixelValues: DEFAULT_PIXEL_VALUES,
    backgrounds: DEFAULT_BACKGROUNDS,
    emojis: DEFAULT_EMOJIS
}

const DEFAULT_SETTINGS: SettingsData = {
    teamsNameMappings: {}
}

export class DataManager {
    currentData: ThemeData = DEFAULT_DATA;
    currentThemes: { [key: string]: string } = DEFAULT_THEMES;
    currentSettings: SettingsData = DEFAULT_SETTINGS;


    constructor() {
        console.log("Created new DataManager instance");
    }

    async loadAll(): Promise<void> {
        await this.loadData();
        await this.loadThemes();
        await this.loadSettings();
    }

    async loadData(): Promise<ThemeData> {

        const data = await p_basicDataLoad("themeData");
        if (data == null) {
            console.warn("No data found, returning default data");

            this.currentData = DEFAULT_DATA;

            return DEFAULT_DATA;
        }

        console.log(data);

        const repairedData: ThemeData = {
            colors: p_basicDataRepair(data["colors"], DEFAULT_COLORS),
            classColors: p_basicDataRepair(data["classColors"], CLASS_COLORS),
            fonts: p_basicDataRepair(data["fonts"], DEFAULT_FONTS),
            pixelValues: p_basicDataRepair(data["pixelValues"], DEFAULT_PIXEL_VALUES),
            backgrounds: p_basicDataRepair(data["backgrounds"], DEFAULT_BACKGROUNDS),
            emojis: p_basicDataRepair(data["emojis"], DEFAULT_EMOJIS)
        }

        this.currentData = repairedData;

        console.log("Loaded: ", repairedData);

        return repairedData;
    }

    async loadSettings(): Promise<SettingsData> {
        const data = await p_basicDataLoadGeneric<SettingsData>("settings");

        if (data == null) {

            this.currentSettings = DEFAULT_SETTINGS;
            console.warn("No data found; using default");

            return DEFAULT_SETTINGS;

        }

        console.log("Loaded settings: ", data);

        this.currentSettings = data;

        return data;
    }

    async loadThemes() {
        const data = await p_basicDataLoad2("themes");
        if (data != null) {
            console.log("themes loaded: ", data);
            this.currentThemes = data;
            this.saveThemes();
            return data;
        }

        console.error("No themes loaded: ", data);

        

        return;
    }

    exportThemeData() {

        let newList: { [key: string]: { [key: string]: string } } = {};

        for (const propertyName of Object.keys(this.currentData)) {
            const propertyNameTyped: ThemeKeys = propertyName as ThemeKeys;
            const dataCurrent = this.currentData[propertyNameTyped];
            const dataDefault = DEFAULT_DATA[propertyNameTyped];

            newList[propertyName] = this.u_onlyExportChanged(dataCurrent, dataDefault);



        }

        return newList as ThemeData;
    }


    u_onlyExportChanged(currentData: { [key: string]: string }, defaultData: { [key: string]: string }) {
        let outputData: { [key: string]: string } = {};

        let numberChanged = 0;

        console.log("Data: ", defaultData);
        console.log("Current data: ", currentData);
        for (const property in defaultData) {
            const dataCurrent = currentData[property];
            const dataDefault = defaultData[property];
            if (dataCurrent != dataDefault) {
                outputData[property] = dataCurrent;
                numberChanged++;
            }
        }

        console.log("Exporting ", numberChanged, " attributes")

        return outputData;
    }

    saveThemes() {
        console.log("Save themes: ", this.currentThemes);
        chrome.storage.local.set({ "themes": this.currentThemes });
    }

    saveData() {
        console.log("Save: ", this.currentData);
        chrome.storage.local.set({ "themeData": this.currentData });
    }

    saveSettings() {
        console.log("Save: ", this.currentSettings);
        chrome.storage.local.set({"settings": this.currentSettings});
    }

    saveAll() {
        this.saveData();
        this.saveThemes();
        this.saveSettings();
    }



}



import { DEFAULT_PIXEL_VALUES, DEFAULT_COLORS, CLASS_COLORS, DEFAULT_FONTS, DEFAULT_BACKGROUNDS } from "./shared";
import { DEFAULT_THEMES } from "./contribution/defaultThemes";

async function p_basicDataLoad(key: string): Promise<{[key: string]: string} | undefined> {
    const result = (await chrome.storage.local.get([key]))[key];
    if (result == null) {
        console.log("Nothing with basi ckey loaded")
        return;
    }
    console.log("loaded key");
    return result;
}

function p_basicDataRepair(data: {[key: string]: string}, defaults: {[key: string]: string}): {[key: string]: string} {
    //console.log(data);
    //console.log(defaults);
    for (const property in defaults) {
        if (property in data == false) {
            console.log(`Missing property ${property}. Setting to default.`);
            data[property] = defaults[property];
        }
    }
    for (const property in data) {
        if (property in defaults == false) {
            console.log(`Additional property ${property}. Removing`);
            delete data[property];
        }
    }

    return data;
}

///////// Functions for storing / loading fonts ////////

export class DataManager {
    currentColors = DEFAULT_COLORS;
    currentClassesColors: { [key: string]: string } = CLASS_COLORS;
    currentFonts: { fontFamily: string, imports: string } = DEFAULT_FONTS;
    currentPixelValues: { [key: string]: string } = DEFAULT_PIXEL_VALUES;
    currentThemes: {[key: string]: string} = DEFAULT_THEMES;
    currentBackgrounds: {[key: string]: string} = DEFAULT_BACKGROUNDS;
    
    constructor() {
        console.log("Created new DataManager instance");
    }

    async loadAll(): Promise<void> {
        await this.loadColors();
        await this.loadClassColors();
        await this.loadFonts();
        await this.loadPixelValues();
    }

    async loadColors(): Promise<{[key: string]: string} | undefined> {
        const data = await p_basicDataLoad("colors");
        if (data) {
            const repairedData = p_basicDataRepair(data, DEFAULT_COLORS);
            this.currentColors = repairedData;
            return repairedData;
        }

    }

    async loadClassColors(): Promise<{[key: string]: string} | undefined> {
        const data = await p_basicDataLoad("classColors");
        if (data) {
            const repairedData = p_basicDataRepair(data, CLASS_COLORS);
            this.currentClassesColors = repairedData;
            return repairedData;
        }
    }
    async loadFonts(): Promise<{fontFamily: string, imports: string}  | undefined> {
        const data = await p_basicDataLoad("fonts") ;
        if (data) {
            this.currentFonts = data as {fontFamily: string, imports: string};
            return data as {fontFamily: string, imports: string};
        }
    }
    async loadPixelValues(): Promise<{[key: string]: string} | undefined> {
        const data = await p_basicDataLoad("pixelValues");
        if (data) {
            const repairedData = p_basicDataRepair(data, DEFAULT_PIXEL_VALUES);
            this.currentPixelValues = repairedData;
            return repairedData;
        }
    }
    async loadThemes() {
        const data = await p_basicDataLoad("themes");
        if (data != null) {
            console.log("themes loaded: ", data);
            this.currentThemes = data;
            this.saveThemes();
            return data;
        }
    
        console.error("No themes loaded: ", data);
        return;
    }
    async isTwemojiEnabled() {
        return (await chrome.storage.local.get(["twemoji"])).twemoji == true;
    }
    async loadBackgrounds() {
        const data = await p_basicDataLoad("backgrounds");
        if (data != null) {
            const repairedData = p_basicDataRepair(data, DEFAULT_BACKGROUNDS);
            
            this.currentBackgrounds = repairedData;
            return repairedData;
        }
    }
    
    u_onlyExportChanged(currentData: {[key: string]: string}, defaultData: {[key: string]: string}) {
        let outputData: {[key: string]: string} = {};
        for (const property in defaultData) {
            const dataCurrent = currentData[property];
            const dataDefault = defaultData[property];
            if (dataCurrent != dataDefault) {
                outputData[property] = dataCurrent;
            }
        }
    
        return outputData;
    }

    saveThemes() {
        console.log("Save themes: ", this.currentThemes);
        chrome.storage.local.set({"themes": this.currentThemes});
    }

    saveColors() {
        chrome.storage.local.set({"colors": this.currentColors});
    } 
    
    saveFonts() {
        chrome.storage.local.set({"fonts": this.currentFonts});
    } 

    savePixelValues() {
        chrome.storage.local.set({"pixelValues": this.currentPixelValues});
    }

    saveClassColors() {
        console.log("Save: ", this.currentClassesColors);
        chrome.storage.local.set({"classColors": this.currentClassesColors});
    } 
    saveBackgrounds() {
        console.log("Save: ", this.currentBackgrounds);
        chrome.storage.local.set({"backgrounds": this.currentBackgrounds});
    }

    saveAll() {
        this.saveColors();
        this.saveClassColors();
        this.savePixelValues();
        this.saveFonts();
        this.saveBackgrounds();
    }

}



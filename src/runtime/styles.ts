import { DataManager } from "../dataManagement";
import { CLASS_PROPERTIES } from "../shared";

export class RuntimeStyles {
    
    styleElement: HTMLStyleElement | null = null;
    emojithis: HTMLStyleElement | null = null;
    dataManager: InstanceType<typeof DataManager> | null;

    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }

    private p_dataManagerExists(): asserts this is { dataManager: DataManager } {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    private p_emojiThisExists(): asserts this is { emojithis: HTMLStyleElement} {
        if (this.emojithis == null) {
            throw new Error("where emojithis");
        }
    }

    applyColors() {
        this.p_dataManagerExists();
        console.log("applying");
    
        const EMOJI_STYLE = `
        
        .emoji{
            width: 1em;
            height: 1em;
            margin-right: 2px;
            vertical-align: middle;
        }
        `
    
        this.styleElement = document.createElement("style");
        this.styleElement.type = "text/css";
    
        let cssContent = "";
        for (const property in this.dataManager.currentColors) {
            console.log("co: applying ", property);
            cssContent += `${property}: ${this.dataManager.currentColors[property]} !important;\n`;
        }
    
        for (const property in this.dataManager.currentPixelValues) {
            console.log("px: applying ", property);
            cssContent += `${property}: ${this.dataManager.currentPixelValues[property]} !important; \n`;
        }
    
        let classCSSContent = "";
        for (const property in this.dataManager.currentClassesColors) {
            const propertyName = CLASS_PROPERTIES[property];
            classCSSContent += `.${property}{${propertyName}: ${this.dataManager.currentClassesColors[property]} !important;}\n`;
        }
    
        // Inject the CSS content into the <style> element
        this.styleElement.innerHTML = `.fui-FluentProviderr0 {\n${cssContent}\n} ${classCSSContent}\n${EMOJI_STYLE}`;
        console.log(this.styleElement.innerHTML);
        document.head.appendChild(this.styleElement);
    }
    
    
    
    
    applyFonts(parent: HTMLHeadElement | null) {
        this.p_dataManagerExists();

        this.emojithis = document.createElement("style");
        this.emojithis.type = "text/css";

        this.p_emojiThisExists();
        if (this.dataManager.currentFonts == null) {
            return;
        }
        this.emojithis = document.createElement("style");
        this.emojithis.type = "text/css";
    
        let cssContent = `--fontFamilyBase: ${this.dataManager.currentFonts["fontFamily"]} !important;}`
        let additionalImports = this.dataManager.currentFonts["imports"];
        let fuiContent = `.fui-FluentProviderr0 {\n${cssContent}\n}`;
        let bodyContent = `* {\n${cssContent}\n}`;
        this.emojithis.innerHTML = `${additionalImports}\n${bodyContent}\n${fuiContent}`;
        console.log(this.emojithis.innerHTML);
        if (parent == null) {
            document.head.appendChild(this.emojithis);
            return this.emojithis;
        } else {
            parent.appendChild(this.emojithis);
            return this.emojithis;
        }
    }
    
    deleteFontsStyle() {
        if (this.emojithis == null) return;
        this.emojithis.remove();
        this.emojithis = null;
    }
    
    
    deleteStyle() {
        if (this.styleElement == null) return;
        this.styleElement.remove();
        this.styleElement = null;
    }
}
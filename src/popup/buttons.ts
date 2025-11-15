import { p_decompressFromBase64, p_compressToBase64 } from "./compression";
import { DataManager } from "../dataManagement";
import { ThemeManager } from "./themes";
import { DEFAULT_COLORS, DEFAULT_PIXEL_VALUES, CLASS_COLORS } from "../shared";

function p_importWaitForPaste() : Promise<string | null> {
    return new Promise((resolve, reject) => {

        const pasteInput = document.querySelector("#pasteArea") as HTMLInputElement;
        const pasteBtn = document.querySelector("#pasteOK") as HTMLButtonElement;



        if (pasteInput == null || pasteBtn == null) {
            console.error("One or many null");
            resolve(null);
            return;
        }
        pasteInput.style.display = "block";
        pasteBtn.style.display = "block";

        pasteBtn?.addEventListener("click", function() {
            pasteInput.style.display = "none";
            pasteBtn.style.display = "none";
            resolve(pasteInput.value);
            
        })
    })
}

export class ButtonHandlers {
    
    dataManager: InstanceType<typeof DataManager>;
    themeManager: InstanceType<typeof ThemeManager>;

    constructor(dataManager: InstanceType<typeof DataManager>, themeManager: InstanceType<typeof ThemeManager>) {
        this.dataManager = dataManager;
        this.themeManager = themeManager;
    } 
    
    importHandlers() {
        const importvarcolorsBtn = document.querySelector("#importvarcolors");
        const importclasscolorsBtn = document.querySelector("#importclasscolors");
        const importfontsBtn = document.querySelector("#importfonts");
        const importpixelvaluesBtn = document.querySelector("#importpixelvalues");
        const importthemeBtn = document.querySelector("#importTheme");
    
        if (importvarcolorsBtn == null || importclasscolorsBtn == null || importfontsBtn == null || importpixelvaluesBtn == null || importthemeBtn == null) {
            console.error("One or many buttons == null");
            return;
        }
    
        /*importvarcolorsBtn.addEventListener("click", async () => {
            try {
                const a = await p_importWaitForPaste();
                if (a == null) {
                    alert("No data entered");
                    return;
                }
    
                const d = JSON.parse(await p_decompressFromBase64(a));
                this.dataManager.currentColors = d;
                this.dataManager.saveColors();
            } catch {
                alert("Failed to process data");
            }
        });
    
        importclasscolorsBtn.addEventListener("click", async () => {
            try {
                const a = await p_importWaitForPaste();
                if (a == null) {
                    alert("No data entered");
                    return;
                }
    
                const d = JSON.parse(await p_decompressFromBase64(a));
                this.dataManager.currentClassesColors = d;
                this.dataManager.saveClassColors();
            } catch {
                alert("Failed to process data");
            }
        });
        importfontsBtn.addEventListener("click", async () => {
            try {
                const a = await p_importWaitForPaste();
                if (a == null) {
                    alert("No data entered");
                    return;
                }
    
                const d = JSON.parse(await p_decompressFromBase64(a));
                this.dataManager.currentFonts = d;
                this.dataManager.saveFonts();
            } catch {
                alert("Failed to process data");
            }
        });
    
        importpixelvaluesBtn.addEventListener("click", async () => {
            try {
                const a = await p_importWaitForPaste();
                if (a == null) {
                    alert("No data entered");
                    return;
                }
    
                const d = JSON.parse(await p_decompressFromBase64(a));
                this.dataManager.currentPixelValues = d;
                this.dataManager.savePixelValues();
            } catch {
                alert("Failed to process data");
            }
        });
        importthemeBtn.addEventListener("click", async () => {
            try {
                const a = await p_importWaitForPaste();
                if (a == null) {
                    alert("No data was entered");
                    return;
                }
    
                const d: {
                    data: {
                        varColors: {
                            [key: string]: string;
                        };
                        classColors: {
                            [key: string]: string;
                        };
                        fonts: {
                            fontFamily: string;
                            imports: string;
                        };
                        otherSettings: {
                            [key: string]: string;
                        };
                        twemojiSupport: boolean;
                    };
                    name: string;
                    data_version: number;
                } = JSON.parse(await p_decompressFromBase64(a));
                if (d["name"] == null) {
                    alert("Could not find theme name. Invalid theme");
                    return;
                }
                if (this.dataManager.currentThemes[d["name"]] != null) {
                    alert("theme with same name present. please delete old theme.");
                    return;
                }
                this.themeManager.addTheme(d["name"], a);
                alert("Successfully added theme");
    
            } catch {
                alert("Failed to process data");
            }
        })*/
    }

    p_exportHandlers() {
        const copyvarcolorsBtn: HTMLButtonElement | null = document.querySelector("#copyvarcolors");
        const copyclasscolorsBtn: HTMLButtonElement | null = document.querySelector("#copyclasscolors");
        const copyfontsBtn: HTMLButtonElement | null = document.querySelector("#copyfonts");
        const copypixelvaluesBtn: HTMLButtonElement | null = document.querySelector("#copypixelvalues");
        const exportTheme: HTMLButtonElement | null = document.querySelector("#exportTheme");
        const saveAsThemeBtn: HTMLButtonElement | null = document.querySelector("#saveAsTheme");
    
        if (copyvarcolorsBtn == null || copyclasscolorsBtn == null || copyfontsBtn == null || copypixelvaluesBtn == null || saveAsThemeBtn == null) {
            console.error("One or many buttons == null");
            return;
        }
    
        copyvarcolorsBtn.addEventListener("click", async () => {
            //await navigator.clipboard.writeText(await p_compressToBase64(JSON.stringify(this.dataManager.u_onlyExportChanged(this.dataManager.currentColors, DEFAULT_COLORS))));
            //alert("Copied to clipboard");
        });
    
        copyclasscolorsBtn.addEventListener("click", async () => {
            //await navigator.clipboard.writeText(await p_compressToBase64(JSON.stringify(this.dataManager.u_onlyExportChanged(this.dataManager.currentClassesColors, CLASS_COLORS))));
            //alert("Copied to clipboard");
        });
    
        copyfontsBtn.addEventListener("click", async () => {
            //await navigator.clipboard.writeText(await p_compressToBase64(JSON.stringify(this.dataManager.currentFonts)));
            //alert("Copied to clipboard");
        });
    
        copypixelvaluesBtn.addEventListener("click", async () => {
            //await navigator.clipboard.writeText(await p_compressToBase64(JSON.stringify(this.dataManager.u_onlyExportChanged(this.dataManager.currentPixelValues, DEFAULT_PIXEL_VALUES))));
            //alert("Copied to clipboard");
        })
        exportTheme?.addEventListener("click", async () => {
            const themeName = prompt("Enter theme name:");
            if (themeName == null) {
                alert("No theme name was entered");
                return;
            }
            setTimeout(async () => {
                try {
                    await navigator.clipboard.writeText(await this.themeManager.p_generateThemeData(themeName));
                    alert("Copied to clipboard");
                } catch (error) {
                    console.error("Failed to write to clipboard ", error);
                    alert("Failed to copy. Please click somewhere in the popup after you confirm to prevent document losing focus.");
                }
    
            }, 1000);
    
    
        })
        saveAsThemeBtn.addEventListener("click", () => {
            const themeName = prompt("Enter theme name:");
            if (themeName == null) {
                alert("No theme name was entered");
                return;
            }
            if (this.dataManager.currentThemes[themeName] != null) {
                alert("theme with same name already present.");
                return;
            }
            setTimeout(async () => {
                try {
                    this.themeManager.addTheme(themeName, await this.themeManager.p_generateThemeData(themeName));
                    this.dataManager.saveThemes();
                    await this.dataManager.loadThemes();
                    await this.themeManager.updateThemesList();
    
                    alert("Generated theme");
                } catch (error) {
                    console.error("Failed to gen theme ", error);
                    alert("Theme gen failed");
                }
    
            }, 1000);
        })
    
    }
}
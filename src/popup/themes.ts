import { DEFAULT_THEMES } from "../contribution/defaultThemes";
import { DEFAULT_FONTS, DEFAULT_COLORS, DEFAULT_PIXEL_VALUES, CLASS_COLORS, DEFAULT_BACKGROUNDS } from "../shared";
import { DataManager } from "../dataManagement";
import { confirmation } from "./ui";
import { p_stringToElement } from "../utils";


//const THEME_NECESSARY_MAIN_KEYS = {"data": {"classColors": null, "varColors": null, "fonts": {"fontFamily": null}, "otherSettings": null, "twemojiSupport": null}, "version": null, "name": null};
const THEME_VERSION_CURRENT = 1;

const THEME_CARD_HTML = `
                <div class="theme">
                    <h3 class="theme-title">Dark cozy blue</h3>
                    <p class="theme-descripton">Color and fonts theme</p>
                    <div class="actions">
                        <button class="text-btn" id="apply-btn">Apply</button>
                        <button class="text-btn" id="export-theme">
                            Export
                        </button>
                        <button class="text-btn" id="delete-theme">
                            Delete
                        </button>
                    </div>

                </div>
`;

export class ThemeManager {
    currentThemes: {[key: string]: string} = DEFAULT_THEMES;
    dataManager: InstanceType<typeof DataManager>;

    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }

    private p_syncDataManager() {
        this.p_dataManagerExists();
        this.dataManager.currentThemes = this.currentThemes;
    }
    p_syncInstanceWithDataManager() {
        this.p_dataManagerExists();
        this.currentThemes = this.dataManager.currentThemes;
    }
    private p_dataManagerExists(): asserts this is { dataManager: DataManager } {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    p_isThemeValid(themeString: string) {
        let themeDataParsed: {
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
                backgrounds: {
                    [key: string]: string;
                };
                twemojiSupport: boolean;
            };
            name: string;
            data_version: number;
        } = JSON.parse(themeString);
    
        // Check data
        if (themeDataParsed["data"] == null) {
            console.error("Data field not found; failed to load theme");
            return;
        }
        // Fix theme if needed
        if (themeDataParsed["data"]["classColors"] == null) {
            console.error("Field not found. Override with default.");
            themeDataParsed["data"]["classColors"] = CLASS_COLORS;
        }
        if (themeDataParsed["data"]["varColors"] == null) {
            console.error("Field not found. Override with default.");
            themeDataParsed["data"]["varColors"] = DEFAULT_COLORS;
        }
        if (themeDataParsed["data"]["fonts"] == null) {
            console.error("Field not found. Override with default.");
            themeDataParsed["data"]["fonts"] = DEFAULT_FONTS;
        }
        if (themeDataParsed["data"]["otherSettings"] == null) {
            console.error("Field not found. Override with default.");
            themeDataParsed["data"]["otherSettings"] = DEFAULT_PIXEL_VALUES;
        }
        if (themeDataParsed["data"]["twemojiSupport"] == null) {
            console.error("Field not found. Override with default.");
            themeDataParsed["data"]["twemojiSupport"] = false;
        };
        if (themeDataParsed["data"]["backgrounds"] == null) {
            console.error("Backgrounds field not found. Overriding with default.");
            themeDataParsed["data"]["backgrounds"] = DEFAULT_BACKGROUNDS;
        }

        return themeDataParsed;

        // Check version
    }

    addTheme(themeName: string, themeData_JSON: string) {
        console.log(themeName, themeData_JSON);
        this.p_syncInstanceWithDataManager();
        this.p_dataManagerExists();
        console.log("Adding theme ", themeName, " to current themes");
        this.currentThemes[themeName] = themeData_JSON;
        this.p_syncDataManager();
        this.dataManager.saveThemes();
        this.dataManager.loadThemes();
        this.p_syncDataManager();
        console.log("Added theme");
        // this.updateThemeList()

    }

    async p_generateThemeData(themeName: string) {
        console.log("GENERATE DATA");
        const themeDict = {
            data: {
                varColors: this.dataManager.u_onlyExportChanged(this.dataManager.currentColors, DEFAULT_COLORS),
                classColors: this.dataManager.u_onlyExportChanged(this.dataManager.currentClassesColors, CLASS_COLORS),
                fonts: this.dataManager.currentFonts,
                otherSettings: this.dataManager.u_onlyExportChanged(this.dataManager.currentPixelValues, DEFAULT_PIXEL_VALUES),
                backgrounds: this.dataManager.u_onlyExportChanged(this.dataManager.currentBackgrounds, DEFAULT_BACKGROUNDS),
                twemojiSupport: await this.dataManager.isTwemojiEnabled()
            },
    
            name: themeName,
            data_version: THEME_VERSION_CURRENT // Change this everytime format is updated
        }

        console.log("EXPORT: ", themeDict.data.backgrounds);
    
        return JSON.stringify(themeDict);
    
    }

    async applyTheme(themeName: string) {
        this.p_dataManagerExists();

        console.log(this.currentThemes);
        const themeDataUnparsed: string = this.currentThemes[themeName];
        console.log(themeDataUnparsed);
        
        let themeDataParsed = this.p_isThemeValid(themeDataUnparsed);
        if (themeDataParsed == null) {
            throw Error("error");
        }
        
        const currentVarColorsTemp = {...this.dataManager.currentColors}
        const currentClassColorsTemp = {...this.dataManager.currentClassesColors}
        const currentPxValuesTemp = {...this.dataManager.currentPixelValues}
        const currentFontsValuesTemp = {...this.dataManager.currentFonts}
        const currentBackgroundsValuesTemp = {...this.dataManager.currentBackgrounds};
    
        try {
            this.dataManager.currentColors = themeDataParsed["data"]["varColors"];
            this.dataManager.currentClassesColors = themeDataParsed["data"]["classColors"];
            this.dataManager.currentFonts = themeDataParsed["data"]["fonts"];
            this.dataManager.currentPixelValues = themeDataParsed["data"]["otherSettings"];
            this.dataManager.currentBackgrounds = themeDataParsed["data"]["backgrounds"];
    
            // Update twemoji support
            chrome.storage.local.set({"twemoji": themeDataParsed["data"]["twemojiSupport"]});
            const i = document.querySelector("#twemojiSupport") as HTMLInputElement;
            if (i) {
                i.checked = await this.dataManager.isTwemojiEnabled();
                i.addEventListener("input", function() {
                    console.log("Save Twemoji state");
                    chrome.storage.local.set({"twemoji": i.checked});
                })
            }
    
            this.dataManager.saveAll();
            console.log("Successfully loaded theme.");
        } catch (error) {
            console.error("Failed to apply theme ", error);
            console.error("Reverting to original state.");
    
            this.dataManager.currentColors = currentVarColorsTemp;
            this.dataManager.currentFonts = currentFontsValuesTemp;
            this.dataManager.currentPixelValues = currentPxValuesTemp;
            this.dataManager.currentClassesColors = currentClassColorsTemp;
            this.dataManager.currentBackgrounds = currentBackgroundsValuesTemp;
    
            console.log("Reverted to original state.");
        } finally  {
            console.log("Successfully applied theme with no issues.");
        }
    
        
    }

    async updateThemesList() {
        this.p_dataManagerExists();
        console.log("Updating theme list");
    
        const availableThemesElement = document.querySelector("#availableThemes");
        if (availableThemesElement == null) {
            console.error("Failed to update available themes: element not found");
            return;
        }
        availableThemesElement.innerHTML = ""; // Clear existing buttons
    
        await this.dataManager.loadThemes();
    
        for (const themeName in this.dataManager.currentThemes) {
    
            // Create new element thing
    
            const a = p_stringToElement(THEME_CARD_HTML);
            
            const themeNameH3 = a.querySelector(".theme-title");
            const applyButton = a.querySelector("#apply-btn");
            const exportButton = a.querySelector("#export-theme");
            const deleteButton = a.querySelector("#delete-theme");

            if (themeNameH3 == null || exportButton == null || applyButton == null || deleteButton == null) return;

            themeNameH3.textContent = `${themeName}`;
    

            applyButton.textContent = "Load";

            deleteButton.textContent = "Delete";

            exportButton.textContent = "Export";
    
    

    
            // Button functions
    
            /*Applies the theme*/
            applyButton.addEventListener("click", async () => {
                if (confirmation() == false) {
                    alert("User has not confirmed");
                    return;
                }
                await this.dataManager.loadThemes();
                this.currentThemes = this.dataManager.currentThemes;
                await this.applyTheme(themeName);
                alert("Successfully applied theme. Please close and reopen the popup to see changes in the advanced tab.");
            });
            /*Deletes the theme*/
            deleteButton.addEventListener("click", async () => {
                if (confirmation() == false) {
                    alert("User has not confirmed");
                    return;
                }
                // Delete the thing
                try {
                    delete this.dataManager.currentThemes[themeName];
                    this.dataManager.saveThemes();
                } catch (error) {
                    console.error("Failed to delete: ", error);
                    alert("Failed to delete theme");
                    return;
                } finally {
                    await this.updateThemesList();
                    alert("Successfully deleted the theme");
                }
            });
            /*Exports the theme*/
            exportButton.addEventListener("click", async () => {
                if (this.dataManager.currentThemes[themeName] == null) {
                    console.error("Current theme not found");
                    alert("Current theme not found");
                    return;
                }
                await navigator.clipboard.writeText(this.dataManager.currentThemes[themeName]);
                alert("Theme copied to clipboard");
            })
            // Add to final element
            availableThemesElement.appendChild(a);
    
    
        }
    
        console.log("Done updating theme list");
    
    }
}


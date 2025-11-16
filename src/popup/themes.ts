import { DEFAULT_THEMES } from "../contribution/defaultThemes";
import { DEFAULT_FONTS, DEFAULT_COLORS, DEFAULT_PIXEL_VALUES, CLASS_COLORS, DEFAULT_BACKGROUNDS, DEFAULT_EMOJIS } from "../shared";
import { DataManager, ThemeData, ThemeKeys, ThemeKeysList } from "../dataManagement";
import { confirmation } from "./ui";
import { p_stringToElement } from "../utils";


//const THEME_NECESSARY_MAIN_KEYS = {"data": {"classColors": null, "varColors": null, "fonts": {"fontFamily": null}, "otherSettings": null, "twemojiSupport": null}, "version": null, "name": null};
const THEME_VERSION_CURRENT = 2;

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
    dataManager: InstanceType<typeof DataManager>;

    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }


    private isStringDict(obj: any): obj is Record<string, string> {
        return (
            typeof obj === "object" &&
            obj !== null &&
            !Array.isArray(obj) &&
            Object.values(obj).every(val => typeof val === "string")
        );
    }

    private p_syncDataManager() {
    }
    p_syncInstanceWithDataManager() {

    }
    private p_dataManagerExists(): asserts this is { dataManager: DataManager } {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }

    private p_isThemeValid_dataLegacy_parser(themeString: string) {
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

        let data: ThemeData = {
            colors: themeDataParsed["data"]["varColors"],
            classColors: themeDataParsed["data"]["classColors"],
            fonts: themeDataParsed["data"]["fonts"],
            pixelValues: themeDataParsed["data"]['otherSettings'],
            backgrounds: themeDataParsed["data"]["backgrounds"],
            emojis: { set: themeDataParsed["data"]["twemojiSupport"] ? "twemoji" : "default" }
        };

        // Fix theme if needed
        if (themeDataParsed["data"]["classColors"] == null) {
            console.error("Field not found. Override with default.");
            data.classColors = CLASS_COLORS;
        }
        if (themeDataParsed["data"]["varColors"] == null) {
            console.error("Field not found. Override with default.");
            data.colors = DEFAULT_COLORS;
        }
        if (themeDataParsed["data"]["fonts"] == null) {
            console.error("Field not found. Override with default.");
            data.fonts = DEFAULT_FONTS;
        }
        if (themeDataParsed["data"]["otherSettings"] == null) {
            console.error("Field not found. Override with default.");
            data.pixelValues = DEFAULT_PIXEL_VALUES;
        }
        if (themeDataParsed["data"]["twemojiSupport"] == null) {
            console.error("Field not found. Override with default.");
            data.emojis = DEFAULT_EMOJIS;
        };
        if (themeDataParsed["data"]["backgrounds"] == null) {
            console.error("Backgrounds field not found. Overriding with default.");
            data.backgrounds = DEFAULT_BACKGROUNDS;
        }

        console.log(data);

        return {
            data: data,
            name: themeDataParsed["name"],
            data_version: themeDataParsed["data_version"]
        };

    }


    p_isThemeValid(themeString: string) {
        let themeDataParsed: {
            data: ThemeData;
            name: string;
            data_version: number;
        } = JSON.parse(themeString);

        // Check data
        if (themeDataParsed["data"] == null) {
            console.error("Data field not found; failed to load theme");
            return;

        }

        if (themeDataParsed["data_version"] == 1) {
            console.log("Using legacy parser");
            return this.p_isThemeValid_dataLegacy_parser(themeString);
        }
        // Fix theme if needed

        for (const key of Object.keys(themeDataParsed["data"])) {
            if (ThemeKeysList.includes(key) == false) {
                console.error("Error: invalid theme. Contains unrecognized theme.");
                return;
            }

            if (this.isStringDict(themeDataParsed["data"][key as ThemeKeys]) == false) {
                console.error("Error: Theme is not of valid type");
                return;
            }
        }

        for (const key of ThemeKeysList) {
            if (themeDataParsed["data"][key as ThemeKeys] == null) {
                console.warn("Fixing missing key: ", key);
                themeDataParsed["data"][key as ThemeKeys] = {};
            }
        }
        return themeDataParsed;

        // Check version
    }

    addTheme(themeName: string, themeData_JSON: string) {
        console.log(themeName, themeData_JSON);
        this.p_syncInstanceWithDataManager();
        this.p_dataManagerExists();
        console.log("Adding theme ", themeName, " to current themes");
        this.dataManager.currentThemes[themeName] = themeData_JSON;
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
            data: this.dataManager.exportThemeData(),
            name: themeName,
            data_version: THEME_VERSION_CURRENT // Change this everytime format is updated
        }

        console.log("EXPORT: ", themeDict.data.backgrounds);

        return JSON.stringify(themeDict);

    }

    async applyTheme(themeName: string) {
        this.p_dataManagerExists();

        console.log(this.dataManager.currentThemes);
        const themeDataUnparsed: string = this.dataManager.currentThemes[themeName];
        console.log(themeDataUnparsed);

        let themeDataParsed = this.p_isThemeValid(themeDataUnparsed);
        if (themeDataParsed == null) {
            throw Error("error");
        }

        const currentDataTemp = { ...this.dataManager.currentData };

        try {
            this.dataManager.currentData = (themeDataParsed.data) as ThemeData;

            const i = document.querySelector("#twemojiSupport") as HTMLInputElement;
            if (i) {
                i.checked = await this.dataManager.currentData["emojis"]["set"] == "twemoji";
                i.addEventListener("input", function () {
                    console.log("Save Twemoji state");
                    chrome.storage.local.set({ "twemoji": i.checked });
                })
            }

            this.dataManager.saveAll();
            console.log("Successfully loaded theme.");
        } catch (error) {
            console.error("Failed to apply theme ", error);
            console.error("Reverting to original state.");

            this.dataManager.currentData = currentDataTemp;

            console.log("Reverted to original state.");
        } finally {
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
                this.dataManager.currentThemes = this.dataManager.currentThemes;
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


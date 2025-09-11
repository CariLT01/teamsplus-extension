import { DataManager } from "../dataManagement";
import { CLASS_PROPERTIES } from "../shared";

let USE_FULL_BACKGROUND = true;


export class RuntimeStyles {

    styleElement: HTMLStyleElement | null = null;
    emojithis: HTMLStyleElement | null = null;
    dataManager: InstanceType<typeof DataManager> | null;
    observer: MutationObserver | null = null;
    blurBackgroundObserver: MutationObserver | null = null;

    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }

    private p_dataManagerExists(): asserts this is { dataManager: DataManager } {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }
    private p_emojiThisExists(): asserts this is { emojithis: HTMLStyleElement } {
        if (this.emojithis == null) {
            throw new Error("where emojithis");
        }
    }

    private p_addBackgroundImageToMessageBackground(target: HTMLDivElement) {
        // Get the thing
        if (this.dataManager == null) {
            throw new Error("No data manager");
        };
        const backgroundStyle: string = this.dataManager.currentBackgrounds["channelAndChatBackground"];
        if (backgroundStyle == null) {
            throw new Error("Data style failed to find");
        };
        if (backgroundStyle == "none") {
            target.style.background = "";
            console.log("Backgrounds: none applied");
            return;
        }

        target.style.background = backgroundStyle;
        console.log("Backgrounds: applied: ", backgroundStyle);
    }

    private p_getBackgroundRGBA(el: HTMLElement) {
        const bg1 = window.getComputedStyle(el);
        const bg = bg1.backgroundColor;

        // matches rgb(r,g,b) or rgba(r,g,b,a)
        const match = bg.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/);

        if (!match) return null;

        return {
            r: parseInt(match[1]),
            g: parseInt(match[2]),
            b: parseInt(match[3]),
            a: match[4] !== undefined ? (Math.min(parseFloat(match[4]), parseFloat(bg1.opacity))) : 1
        };
    }

    private blurProcessElement(el: HTMLElement) {

        if (el instanceof HTMLButtonElement) return;
        if (this.dataManager == null) return;

        const elementColor: {r: number, g: number, b: number, a: number} | null = this.p_getBackgroundRGBA(el);
        if (elementColor == null) return;

        const elementTransparency = Math.min(elementColor.a, parseFloat(this.dataManager.currentBackgrounds["interfaceOpacity"]));
        if (el.style.backgroundColor != "") {
            el.style.backgroundColor = "";
            console.log("Removing bg");
        }
        el.style.backgroundColor = `rgba(${elementColor.r}, ${elementColor.g}, ${elementColor.b}, ${elementTransparency})`;
        if (elementTransparency > 0) {
            el.style.backdropFilter = this.dataManager.currentBackgrounds["backdropFilter"];
        }
        
    }

    private p_applyFullBackground() {
        if (this.dataManager == null) return;
        const backgroundStyle: string = this.dataManager.currentBackgrounds["channelAndChatBackground"];
        if (backgroundStyle == null) {
            throw new Error("Data style failed to find");
        };
        const app = document.getElementById("app");
        if (app == null) {
            throw new Error("App not found");
        }
        if (backgroundStyle == "none") {
            app.style.background = "";
        } else {
            app.style.background = backgroundStyle;
        }

        
    }

    private p_createBlurMutationObserver() {

        const app = document.querySelector("#app") as HTMLDivElement;

        app.querySelectorAll("*").forEach((element) => {
            this.blurProcessElement(element as HTMLElement);
        })

        this.blurBackgroundObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type == "childList") {

                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType == Node.ELEMENT_NODE) {

                            const element: HTMLElement = node as HTMLElement;
                                
                            this.blurProcessElement(element);

                            element.querySelectorAll("*").forEach((childElement) => {
                                this.blurProcessElement(childElement as HTMLElement)
                            });


                        }
                    })

                }
            }
        });
        this.blurBackgroundObserver.observe(document.querySelector("#app") as HTMLDivElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class", "style"]
        });
    }

    private p_createMutationObserver() {
        const targetSelector = '[data-tid="message-pane-layout"]';

        this.observer = new MutationObserver((mutations) => {
            // Only need to check if the target appeared
            const target = document.querySelector(targetSelector) as HTMLDivElement | null;
            if (target) {
                this.p_addBackgroundImageToMessageBackground(target);
            }
        });
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    getFui() {
        let fluentProvider = ".fui-FluentProviderr0";
        if (window.location.hostname == "assignments.onenote.com") {
            console.log("Detected assignments tab, set fluent provider to EDUASSIGN-r0");
            fluentProvider = ".fui-FluentProviderEDUASSIGN-r0";
        } else if (window.location.hostname == "outlook.office.com") {
            fluentProvider = ".fui-FluentProviderr0";
        }
        
        else {
            console.log("Detected main Teams interface, set fluent provider to r0");
        }

        return fluentProvider;
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


    

        this.styleElement.innerHTML = `${this.getFui()} {\n${cssContent}\n} ${classCSSContent}\n${EMOJI_STYLE}`;
        console.log(this.styleElement.innerHTML);
        document.head.appendChild(this.styleElement);
    }

    applyBackgrounds() {
        if (this.dataManager == null) return;
        this.p_applyFullBackground();

        const isFullBackgroundExperienceEnabled = this.dataManager.currentBackgrounds["fullBackgroundExperience"] === "true";


        if (this.observer == null && isFullBackgroundExperienceEnabled == false) {
            console.log("INITIALIZE MUTATION OBSERVER");
            this.p_createMutationObserver();

            const chatBoxes = document.querySelectorAll('[data-tid="message-pane-layout"]');
            chatBoxes.forEach((v) => {
                this.p_addBackgroundImageToMessageBackground(v as HTMLDivElement);
            })
        }
        if (this.blurBackgroundObserver == null && isFullBackgroundExperienceEnabled == true) {
            console.log("INITIALIZE BLUR MUTATION OBSERVER");
            this.p_createBlurMutationObserver();
        }

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



        let fuiContent = `${this.getFui()} {\n${cssContent}\n}`;
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
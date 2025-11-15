import { p_stringToElement } from "../utils";
import { injectTab } from "./tabInject";

const APP_LIST_APP_ELEMENT_HTML = `
<span class="apps-list-app">
    <span class="apps-list-app-card" id="appListCard">
        <img src="https://cdn-icons-png.flaticon.com/512/1144/1144760.png" alt="App Icon" class="app-icon" id="appIcon">
        <span class="apps-list-filler"></span>
        <span class="app-name" id="appName">Bob app that is really really cool</span>
    </span>
    <span type="button" class="app-pin-button" id="pinApp">
        <img src="https://www.svgrepo.com/show/501306/pin.svg" alt="" class="pin-icon">
    </span>
</span>
`;

const APP_MENU_ELEMENT_HTML = `
<span class="apps-menu" id="appsMenu">
    <span class="apps-menu-header">
        <h3 class="apps-menu-title">TeamsPlus apps</h3>
    </span>
    <span class="apps-list" id="appList">


    </span>
</span>
`;

const APP_MENU_ICON_SVG = `
<?xml version="1.0" encoding="UTF-8"?>
<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <title>apps</title>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g id="icon" fill="var(--colorNeutralForeground3)" transform="translate(64.000000, 64.000000)">
            <path d="M64,32 C64,49.664 49.664,64 32,64 C14.336,64 -4.26325641e-14,49.664 -4.26325641e-14,32 C-4.26325641e-14,14.336 14.336,-4.26325641e-14 32,-4.26325641e-14 C49.664,-4.26325641e-14 64,14.336 64,32 Z M224,32 C224,49.664 209.664,64 192,64 C174.336,64 160,49.664 160,32 C160,14.336 174.336,-4.26325641e-14 192,-4.26325641e-14 C209.664,-4.26325641e-14 224,14.336 224,32 Z M64,352 C64,369.664 49.664,384 32,384 C14.336,384 -4.26325641e-14,369.664 -4.26325641e-14,352 C-4.26325641e-14,334.336 14.336,320 32,320 C49.664,320 64,334.336 64,352 Z M224,352 C224,369.664 209.664,384 192,384 C174.336,384 160,369.664 160,352 C160,334.336 174.336,320 192,320 C209.664,320 224,334.336 224,352 Z M64,192 C64,209.664 49.664,224 32,224 C14.336,224 -4.26325641e-14,209.664 -4.26325641e-14,192 C-4.26325641e-14,174.336 14.336,160 32,160 C49.664,160 64,174.336 64,192 Z M224,192 C224,209.664 209.664,224 192,224 C174.336,224 160,209.664 160,192 C160,174.336 174.336,160 192,160 C209.664,160 224,174.336 224,192 Z M384,32 C384,49.664 369.664,64 352,64 C334.336,64 320,49.664 320,32 C320,14.336 334.336,-4.26325641e-14 352,-4.26325641e-14 C369.664,-4.26325641e-14 384,14.336 384,32 Z M384,352 C384,369.664 369.664,384 352,384 C334.336,384 320,369.664 320,352 C320,334.336 334.336,320 352,320 C369.664,320 384,334.336 384,352 Z M384,192 C384,209.664 369.664,224 352,224 C334.336,224 320,209.664 320,192 C320,174.336 334.336,160 352,160 C369.664,160 384,174.336 384,192 Z" id="Combined-Shape">

</path>
        </g>
    </g>
</svg>
`;

const ANIMATION_DURATION: number = 250;

declare global {
    interface Window {
        teamsPlusAppsManager: AppsMenuManager;
    }
}

export class AppsMenuManager {

    appMenuElement!: HTMLDivElement;
    appMenuButton!: HTMLButtonElement;

    appMenuCreated: boolean = false;


    constructor() {
        this.initializeAppMenu();

        window.teamsPlusAppsManager = this;
    }

    private async initializeAppMenu() {
        await this.createAppMenu();
        this.createButtonListeners();

        this.appMenuCreated = true;
    }

    private async isApplicationPinned(name: string) : Promise<boolean> {

        const result = await chrome.storage.local.get(["pinnedApplications"]);
        if (!result.pinnedApplications) {
            return false;
        }
        if (!result.pinnedApplications[name]) {
            return false;
        }
        return true;

    }
    private async createAppMenu() {
        this.appMenuElement = p_stringToElement(APP_MENU_ELEMENT_HTML) as HTMLDivElement;

        this.appMenuButton = await injectTab("TeamsPlus", APP_MENU_ICON_SVG) as HTMLButtonElement;
        if (this.appMenuButton == null) {
            throw new Error("Failed to inject app menu tab");
        }

        document.body.appendChild(this.appMenuElement);

    }

    private animateVisibility(visibility: boolean) {
        if (visibility) {
            this.appMenuElement.animate(
                [
                    { transform: "translateY(-5%)", opacity: 0 },
                    { transform: "translateY(0%)", opacity: 1 }
                ],
                {
                    duration: ANIMATION_DURATION,
                    easing: "ease-out",
                    iterations: 1,
                    fill: "forwards"
                }
            );
        } else {
            this.appMenuElement.animate(
                [
                    { transform: "translateY(0%)", opacity: 1 },
                    { transform: "translateY(-5%)", opacity: 0 }
                ],
                {
                    duration: ANIMATION_DURATION,
                    easing: "ease-in",
                    iterations: 1,
                    fill: "forwards"
                }
            );
        }
    }

    private toggleVisibility() {
        //this.appMenuElement.classList.toggle("active");
        if (this.appMenuElement.classList.contains("active")) {
            this.setVisiblity(false);
        } else {
            this.setVisiblity(true);
        }
    }

    private setVisiblity(visibility: boolean) {
        if (visibility == false && this.appMenuElement.classList.contains("active") == true) {
            this.animateVisibility(false);
            setTimeout(() => {
                this.appMenuElement.classList.remove("active");
            }, ANIMATION_DURATION);
            
        } else {
            if (this.appMenuElement.classList.contains("active") == false && visibility == true) {
                this.appMenuElement.classList.add("active");

                // Set position

                const left = this.appMenuButton.clientLeft + this.appMenuButton.clientWidth;
                const top = this.appMenuButton.clientTop + this.appMenuButton.clientHeight;

                this.appMenuElement.style.left = `${left}px`;
                this.appMenuElement.style.top = `${top}px`;

                this.animateVisibility(true);
            }
        }
    }

    private createButtonListeners() {
        this.appMenuButton.addEventListener("click", (event) => {
            this.toggleVisibility();
            if (event.target !== event.currentTarget && this.appMenuElement.contains(event.target as Node)) {
                // click was inside the menu -> ignore
                return;
            }
            event.stopPropagation();
        });
        document.addEventListener("click", (event: MouseEvent) => this.handleDocumentClick(event));
        this.appMenuElement.addEventListener("click", (event) => {
            event.stopPropagation();
        })

    }

    private handleDocumentClick(event: MouseEvent) {
        if (this.appMenuButton.classList.contains("active") == false) return;
        // check if the click is outside the menu and the button
        if (!this.appMenuElement.contains(event.target as Node) &&
            !this.appMenuButton.contains(event.target as Node)) {
            this.setVisiblity(false);
        }
    }




    async addAppAndGetButton(appName: string, imageSource: string, svgSource?: string): Promise<HTMLSpanElement[]> {

        await new Promise(resolve => { const check = () => (this.appMenuCreated ? resolve(undefined) : setTimeout(check, 50)); check(); });

        if (this.appMenuCreated == false) {
            throw new Error("Attempt to create and add app before app menu initialization!");
        }

        const buttons: HTMLSpanElement[] = [];

        /// Create app thing

        const appElement = p_stringToElement(APP_LIST_APP_ELEMENT_HTML);
        const appIconElement: HTMLImageElement = appElement.querySelector("#appIcon") as HTMLImageElement;
        const appNameElement: HTMLParagraphElement = appElement.querySelector("#appName") as HTMLParagraphElement;

        appNameElement.textContent = appName;
        appIconElement.src = imageSource;

        const appMenuAppList: HTMLDivElement = this.appMenuElement.querySelector("#appList") as HTMLDivElement;
        appMenuAppList.appendChild(appElement);

        console.log("Successfully added app in app menu");

        const cardButton = appElement.querySelector("#appListCard") as HTMLSpanElement;

        cardButton.addEventListener("click", () => {
            this.setVisiblity(false);
        });
        
        const pinButton = appElement.querySelector("#pinApp") as HTMLSpanElement;
        if (await this.isApplicationPinned(appName)) {
            pinButton.style.backgroundColor = "#655bffff";
        }
        pinButton.addEventListener("click", async () => {
            const r = await chrome.storage.local.get(["pinnedApplications"]);
            let pinnedApplications = r.pinnedApplications || {};
            pinnedApplications[appName] = !(pinnedApplications[appName] || false);
            if (pinnedApplications[appName] == true) {
                pinButton.style.backgroundColor = "#655bffff";
            } else {
                pinButton.style.backgroundColor = "transparent";
            }
            chrome.storage.local.set({pinnedApplications});
        })
        
        buttons.push(cardButton as HTMLSpanElement);

        // If pinned, the tab button

        if (await this.isApplicationPinned(appName)) {
            const tabButton = await injectTab(appName, svgSource || `<img src="${imageSource}" alt="Icon">`);
            buttons.push(tabButton as HTMLSpanElement);
        }

        return buttons;
    }

}
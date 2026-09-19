import { createRoot, Root } from "react-dom/client";
import { UserBrowserApp } from "./ui/App";
import "../styles/tailwind.css";
import { injectStyles } from "../injectStyles";

export class UserBrowser {
    private container!: HTMLDivElement;
    private root!: Root;

    private visible: boolean = true;

    constructor() {
        this._createRoot();
        this.hide();
        this._injectFetch();
        this._createTabButtons();
    }

    private _createRoot() {
        this.container = document.createElement("div");
        this.container.style.position = "fixed";
        this.container.style.top = "0";
        this.container.style.left = "0";
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.pointerEvents = "none";
        const shadow = this.container.attachShadow({ mode: "open" });

        /*
        
                console.log("Injecting CSS");
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("main.bundle.css");
        shadow.appendChild(link);
        */

        injectStyles(shadow);

        const reactContainer = document.createElement("div");
        shadow.appendChild(reactContainer);
        this.root = createRoot(reactContainer);
        this.root.render(<UserBrowserApp />);

        document.body.appendChild(this.container);
    }

    private _injectFetch() {
        if (__DESKTOP_APP__) {
            console.log("Not injecting fetch: feature not supported");
            return;
        }
        console.log("Injecting custom FETCH");
        const script = document.createElement("script");
        script.src = chrome.runtime.getURL("teamsFetchBridge.js");
        script.classList.add("TEAMS-CUSTOM-FETCH-PROXY");
        document.body.appendChild(script);
    }

    private async _createTabButtons() {
        const buttons = await window.teamsPlusAppsManager.addAppAndGetButton(
            "Users List",
            "https://www.svgrepo.com/show/535714/users.svg",
        );
        buttons.forEach((button) => {
            button.addEventListener("click", () => {
                if (this.visible) {
                    this.hide();
                } else {
                    this.show();
                }
            });
        });
    }

    show() {
        this.container.style.display = "block";
        this.visible = true;
    }

    hide() {
        this.container.style.display = "none";
        this.visible = false;
    }
}

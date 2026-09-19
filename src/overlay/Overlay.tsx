import { createRoot, Root } from "react-dom/client";
import { OverlayApp } from "./App";
import "../styles/tailwind.css";
import { injectStyles } from "../injectStyles";
import { NotificationType } from "./notificationType";
import { useNotificationStore } from "./stores/NotificationStore";
import { waitForElement } from "../utils";
import { useMessageDialogQueue } from "./stores/MessageDialogQueue";

type DiagButton = {
    text: string;
    primary: boolean;
}

class OverlayClass {
    private container: HTMLDivElement | null = null;
    private root: Root | null = null;
    private idCounter: number = 0;
    private diagIdCounter: number = 0;

    constructor() {}

    async asyncInit() {
        await waitForElement("body");
        this.run();
    }

    run() {
        this._createOverlay();
    }

    private _createOverlay() {
        if (this.container) return;

        if (!document.body) {
            if (document.readyState === "loading") {
                document.addEventListener("DOMContentLoaded", () => this._createOverlay(), { once: true });
            } else {
                window.addEventListener("load", () => this._createOverlay(), { once: true });
            }
            return;
        }

        this.container = document.createElement("div");
        this.container.id = "teamsplus-overlay-root";
        this.container.style.width = "100vw";
        this.container.style.height = "100vh";
        this.container.style.zIndex = "999999";
        this.container.style.position = "fixed";
        this.container.style.pointerEvents = "none";
        this.container.style.top = "0px";
        this.container.style.left = "0px";

        const shadow = this.container.attachShadow({ mode: "open" });
        injectStyles(shadow);

        const reactContainer = document.createElement("div");
        reactContainer.style.width = "100%";
        reactContainer.style.height = "100%";
        reactContainer.style.pointerEvents = "none";
        shadow.appendChild(reactContainer);

        this.root = createRoot(reactContainer);
        this.root.render(<OverlayApp />);

        document.body.appendChild(this.container);

        console.log("Overlay app has been created");
    }

    notify(type: NotificationType, title: string, message: string, duration: number = 15000) {
        console.log("[DEBUG] Notify: ", message, type);

        const currentId = this.idCounter++;

        useNotificationStore.getState().addNotification({
            type: type,
            message: message,
            title: title,
            id: currentId,
        });

        setTimeout(() => {
            useNotificationStore.getState().removeNotification(currentId);
        }, duration);
    }

    ask(title: string, content: string, image: string, buttons: DiagButton[]) {
        return new Promise((resolve, reject) => {

            let result = null

            const nextId = this.diagIdCounter++;

            useMessageDialogQueue.getState().addDialog({
                title: title,
                content: content,
                image: image,
                buttons: buttons,
                id: nextId
            });

            setInterval(() => {
                const s = useMessageDialogQueue.getState().finishedDialogs;
                if (Object.hasOwn(s, nextId)) {
                    result = s[nextId];
                    delete s[nextId];
                    resolve(result);
                }
            }, 250);
        })
    }
}

export const Overlay = new OverlayClass();
(window as any).teamsPlusOverlay = Overlay;
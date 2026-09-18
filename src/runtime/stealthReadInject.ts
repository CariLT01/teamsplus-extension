import { ExtensionStorageProvider } from "../storage/ExtensionStorageProvider";
import { waitForElement } from "../utils";

let injectedButton: HTMLButtonElement | null = null;

async function injectStealthReadButton() {
    const collab = await waitForElement('[data-tid="simple-collab-dnd-rail"]');

    if (!collab) {
        console.error("Timed out waiting for element to inject Stealth Read feature");
        return;
    }

    const currentlyStealthRead = await ExtensionStorageProvider.loadKey("stealthRead");

    const button = document.createElement("button");
    button.textContent = currentlyStealthRead ? "Stealth Read Enabled" : "StealthRead";

    button.title = "Read messages without sending a read receipt. You retain the ability to send messages and see view status of your messages"

    injectedButton = button;

    collab.prepend(injectedButton);

    injectedButton.addEventListener("click", async () => {
        const stealthReadMode = await ExtensionStorageProvider.loadKey("stealthRead");

        ExtensionStorageProvider.storeKey("stealthRead", !stealthReadMode);

        button.textContent = (!stealthReadMode) ? "Stealth Read Enabled" : "StealthRead";
    });

    console.log("Stealth read button injected");


}

export async function injectStealthRead() {
    await injectStealthReadButton();

    setInterval(async () => {
        if (!document.body.contains(injectedButton)) {
            console.warn("Stealth read button reinjection");

            const collab = await waitForElement('[data-tid="simple-collab-dnd-rail"]');

            if (!collab) {
                console.warn("Stealth Reinjection failed: collab not found");
                return;
            }

            if (injectedButton) {
                collab.prepend(injectedButton);
            }
        } else {
            console.log("DOM still contains StealthRead button: ", injectedButton);
        }
    }, 1000);
}
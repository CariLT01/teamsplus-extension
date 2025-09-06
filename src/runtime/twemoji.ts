import { DataManager } from "../dataManagement";
import twemoji from "twemoji";

const onNewEmojiWrapper = (element: HTMLElement) => {
    if (element.getAttribute("twemoji-processed") == "true") return; // Avoid twemoji.parse()
    console.log("New emoji IMG warpper detected, parsing twemoji");
    
    try {
        const parent = element.parentElement;
        if (parent == null) return;
        const originalParent = parent.parentNode as HTMLElement;
        if (originalParent == null) {
            console.log(parent)
            throw new Error("No original parent");
        }
        const unicode = element.getAttribute("alt");
        const originalRect = element.getBoundingClientRect();
        if (unicode == null) {
            console.error(`Unicode not found`);
        } else {

            if (element.querySelector(".fui-ChatMyMessage") == null) {
                parent.outerHTML = `${unicode}`;
            } else {
                parent.innerHTML = `${unicode}`;
            }
            const parsedImg = twemoji.parse(originalParent, {
                base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/",
                folder: "svg",  // or "svg" for vector format
                ext: ".svg"       // or ".svg"
            });
            parsedImg.style.width = `${originalRect.width}px !important`;
            parsedImg.style.height = `${originalRect.height}px !important`;
        }
    } catch (err) {
        console.error("Failed to convert emoji img to chr", err);
    } finally {
        console.log("Convert img to char success");
        element.setAttribute("twemoji-processed", "true");
    }
}

export class TwemojiRuntime {
    
    dataManager: InstanceType<typeof DataManager>;


    constructor(dataManager: InstanceType<typeof DataManager>) {
        this.dataManager = dataManager;
    }

    private p_dataManagerExists(): asserts this is { dataManager: DataManager } {
        if (this.dataManager == null) {
            throw new Error("Where is data manager");
        }
    }

    async applyTwemoji() {
        this.p_dataManagerExists();
        const twemojiEnabled = await this.dataManager.isTwemojiEnabled();
        if (twemojiEnabled == false) {
            console.error("Twemoji is not enabled.Skipping Twemoji");
            return;
        }
        this.detectNewMessages();
    }

    detectNewMessages() {
        // Target the parent container where messages are added (e.g., a chat container)
        const targetNode = document.body; // Replace with a specific parent if possible
    
        // Observer configuration
        const config: MutationObserverInit = {
            childList: true,      // Watch for direct child additions/removals
            subtree: true,        // Watch all descendants (not just direct children)
        };
    
        // Callback when mutations are detected
        const callback: MutationCallback = (mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {


                    // Check each added node for the target element
                    mutation.addedNodes.forEach((node) => {
                        if (!(node instanceof HTMLElement || node instanceof DocumentFragment)) return;
                        // Handle direct matches (if the node itself is the wrapper)
                        if (node instanceof HTMLElement && node.dataset.testid === 'message-wrapper') {
                            onNewMessageWrapper(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.tid === 'chat-pane-compose-message-footer') {
                            onNewMessageWrapper(node);
                        }
                        if (node instanceof HTMLElement && node.getAttribute("itemtype") == "http://schema.skype.com/Emoji") {
                            onNewEmojiWrapper(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.inp === 'message-hover-reactions') {
                            onNewMessageWrapper(node);
                        }
                        if (node instanceof HTMLElement && node.dataset.tid === 'emoji-tab-category-grid') {
                            onNewMessageWrapper(node);
                        }
    
                        // Handle nested matches (if the wrapper is inside the added node)
                        if (node instanceof HTMLElement || node instanceof DocumentFragment) {
                            const wrappers = (node as HTMLElement).querySelectorAll('[data-testid="message-wrapper"]');
    
                            wrappers.forEach((wrapper, index) => onNewMessageWrapper(wrapper as HTMLElement));
    
                            const emojiImgs = (node as HTMLElement).querySelectorAll('[itemtype="http://schema.skype.com/Emoji"]');
                            emojiImgs.forEach((img, index) => onNewEmojiWrapper(img as HTMLElement));
    
                            const messageHoverReactions = (node as HTMLElement).querySelectorAll('[data-inp="message-hover-reactions"]');
                            messageHoverReactions.forEach((img, index) => onNewMessageWrapper(img as HTMLElement));
    
                            const emojiTab = (node as HTMLElement).querySelectorAll('[data-tid="emoji-tab-category-grid"]');
                            emojiTab.forEach((img, index) => onNewMessageWrapper(img as HTMLElement));
                        }
                    });
                }
            }
        };
    
        
    
        // Return a cleanup function to disconnect later
        const onNewMessageWrapper = (element: HTMLElement) => {
            console.log('New message wrapper detected:', element, ", parsing twemoji");
            twemoji.parse(element, {
                base: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/15.1.0/",
                folder: "72x72",  // or "svg" for vector format
                ext: ".png"       // or ".svg"
            });
        };
    
        const observer = new MutationObserver(callback);
        observer.observe(targetNode, config);
    
    
    }

}

export class LoadingScreen {
    
    
    
    textMutationObserver: MutationObserver | null = null;
    textSlideInElement: HTMLDivElement | null = null;
    updateAvailableText: string = "";
    currentVersion: string = "";

    constructor() {

        

    }

    checkForUpdates() {

        this.currentVersion = "v" + chrome.runtime.getManifest().version;

        fetch("https://api.github.com/repos/CariLT01/teamsplus-extension/releases/latest")
        .then(response => response.json())
        .then((data) => {
            const tagName: string = data.tag_name;
            if (tagName && tagName != this.currentVersion) {
                this.updateAvailableText = "Update available: " + this.currentVersion + " → " + tagName;
                this.setTextContent();
            } else if (tagName == this.currentVersion) {
                this.updateAvailableText = "<p style='font-weight: normal; font-size: 12px'>Up to date</p>";
                this.setTextContent();
            }
        }).catch((err) => {
            console.error("Failed to check for updates: ", err);
        });
    }


    private setTextContent() {
        if (!this.textSlideInElement) return;
        const extensionVersion = chrome.runtime.getManifest().version;
        this.textSlideInElement.innerHTML = "Loading Microsoft Teams...<br><br><p style='font-weight: normal; font-size: 16px;'>TeamsPlus v" + extensionVersion + "</p>" + this.updateAvailableText;
    }

    startMutationObserver() {
        this.checkForUpdates();
        this.textMutationObserver = new MutationObserver(
            (mutations) => {

                const textSlideIn = document.querySelector(".text-slide-in");

                if (textSlideIn) {
                    this.textSlideInElement = textSlideIn as HTMLDivElement;

                    
                    this.setTextContent();
                    

                    if (this.textMutationObserver) {
                        this.textMutationObserver.disconnect();
                    }   
                }
            }
        )

        this.textMutationObserver.observe(document.body, {
            subtree: true,
            childList: true,
        });
    }

    
}
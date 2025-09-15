export async function updateVersionNumberAndStatus() {
    const versionNumberElement: HTMLParagraphElement = document.querySelector("#versionNumber") as HTMLParagraphElement;
    const versionStatusElement: HTMLParagraphElement = document.querySelector("#versionStatus") as HTMLParagraphElement;

    const version: string = chrome.runtime.getManifest().version;
    const prefixedVersion: string = "v" + version;


    versionNumberElement.textContent = prefixedVersion;


    if (versionNumberElement == null || versionStatusElement == null) {
        throw new Error("Failed to find versionNumber or versionStatus P element");
    }
    fetch("https://api.github.com/repos/CariLT01/teamsplus-extension/releases/latest")
    .then(response => response.json())
    .then(data => {
            const tagName: string = data.tag_name;
            if (tagName && tagName != prefixedVersion) {
                versionStatusElement.textContent = "Update available: " + tagName;
            } else if (tagName == prefixedVersion) {
                versionStatusElement.textContent = "Up to date";
            }
    })
    .catch((error) => {
        console.error("Failed to check for updates: ", error);
        versionStatusElement.textContent = "Update checker failure";
    })

    
}
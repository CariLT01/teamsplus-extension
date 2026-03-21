
export function injectStyles() {
    console.log("Injecting CSS");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("main.bundle.css");
    document.head.appendChild(link);
}
<<<<<<< HEAD
let injected = false;

export function injectStyles() {
    // Prevent duplicate injection
    if (injected) return;
    injected = true;

    if (__DESKTOP_APP__) {
        import(/* webpackMode: "eager" */ "./styles/tailwind.css?asString").then(({ default: css }) => {
            console.log("Injecting CSS as Desktop App");
            const style = document.createElement("style");
            style.id = "teamsplus-main-style";
            style.textContent = css;
            document.head.appendChild(style);
        });
    } else {
        console.log("Injecting styles as extension");
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("main.bundle.css");
        document.head.appendChild(link);
    }
}
=======

export function injectStyles() {
    console.log("Injecting CSS");
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("main.bundle.css");
    document.head.appendChild(link);
}
>>>>>>> origin/main

const injectedTargets = new WeakSet<Node>();
let headInjected = false;

export function injectStyles(target: Node = document.head) {
    if (target === document.head) {
        if (headInjected) return;
        headInjected = true;
    } else {
        if (injectedTargets.has(target)) return;
        injectedTargets.add(target);
    }

    if (__DESKTOP_APP__) {
        import(/* webpackMode: "eager" */ "./styles/tailwind.css?asString").then(({ default: css }) => {
            console.log("Injecting CSS as Desktop App");
            const style = document.createElement("style");
            style.textContent = css;
            target.appendChild(style);
        });
    } else {
        console.log("Injecting styles as extension");
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = chrome.runtime.getURL("main.bundle.css");
        target.appendChild(link);
    }
}

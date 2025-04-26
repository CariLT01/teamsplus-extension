const parser = new DOMParser();

export function waitForElement(selector: string): Promise<Element> {
    return new Promise((resolve, reject) => {
        const observer = new MutationObserver((mutations) => {
            const element = document.querySelector(selector);
            if (element) {
                observer.disconnect(); // Stop observing once the element is found
                resolve(element);
            }
        });

        observer.observe(document.body, {
            childList: true, // Observe direct children being added or removed
            subtree: true,   // Observe all descendants
        });

        // Optional: Set a timeout to reject the promise if the element doesn't appear
        setTimeout(() => {
            observer.disconnect();
            reject(new Error('Element not found within time limit'));
        }, 10000); // 10 seconds timeout
    });
}

export function p_stringToElement(str: string) {
    return parser.parseFromString(str, "text/html").body.firstElementChild as HTMLElement;
}
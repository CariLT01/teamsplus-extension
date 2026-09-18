
type Listener = (key: string) => void;

class ExtensionStorageProvider__class {

    private changeListeners: Listener[] = [];

    constructor() {

    }

    async loadKey(key: string): Promise<any> {
        // const result = (await chrome.storage.local.get([key]))[key];

        if (!__DESKTOP_APP__) {
            return (await chrome.storage.local.get([key]))[key];
        } else {
            const raw = localStorage.getItem(`TEAMSPLUS__${key}`);
            if (raw == null) return null;
            return JSON.parse(raw);
        }
    }


    async storeKey(key: string, value: any) {
        if (!__DESKTOP_APP__) {
            await chrome.storage.local.set({ [key]: value });
        } else {
            localStorage.setItem(`TEAMSPLUS__${key}`, JSON.stringify(value));
        }

        if (__DESKTOP_APP__) {
            this.changeListeners.forEach((l) => {
                l(key);
            })
        }
    }

    registerChangeListener(listener: Listener) {
        this.changeListeners.push(listener);

        if (!__DESKTOP_APP__) {
            chrome.storage.onChanged.addListener(async (changes, areaName) => {
                if (areaName === 'local') {  // 'sync' refers to chrome.storage.sync
                    // Loop through the changed items
                    for (let key in changes) {
                        if (changes.hasOwnProperty(key)) {
                            listener(key);
                        }
                    }
                }
            });
        }
    }


};

export const ExtensionStorageProvider = new ExtensionStorageProvider__class();
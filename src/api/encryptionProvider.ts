import { injectTab } from "../ui/tabInject";
import { p_stringToElement } from "../utils";
import { API_ENDPOINT } from "../config";
import { AuthProvider } from "./authorizationProvider";
import { SafeTunnel } from "./safeTunnel";
import { promptAndWait } from "../ui/pwdPrompt";

const ENCRYPTION_UI_WINDOW = `
<div class="encryption-ui-window">
    <div class="title-container">
        <div class="title-sub-container">
            <img src="https://www.svgrepo.com/show/513833/lock.svg" alt="" class="lock-icon-title">
            <h2 class="encryption-title">Encryption</h2>
        </div>
        
    </div>
    
    <input type="text" name="search" id="encrypt-search" class="encryption-ui-search" placeholder="Search for accounts..." autocomplete="off">
    <div class="encryption-ui-people">


    </div>
    <p id="selected">Selected: null</p>
    <div class="center">
        <textarea name="encrypt-message" id="encrypt-message" rows="5" placeholder="Type your message here"></textarea>
    </div>

    <div class="center">
        <button type="button" id="encrypt-btn">
            <div class="btn-with-icon">
                <img src="https://www.svgrepo.com/show/513833/lock.svg" alt="" class="btn-icon">
                <span>Encrypt</span>
            </div>
        </button>
    </div>
    
    <div class="center">
        <textarea name="" id="encrypt-output" placeholder="Output will appear here" rows="2"></textarea>
    </div>
    
</div>
`;

const ENCRYPTION_ACCOUNT = `
<div class="person">
    <p id="account-info">Bob</p>
    <span id="account-id">ID: 17</span>
    <div class="center">
        <button type="button" id="select">Select</button>
    </div>
</div>
`;

const DECRYPT_BUTTON = `
<button type="button" id="decrypt-btn">Decrypt</button>
`;

const LONG_YAP = `
**Important information before proceeding**:
Your message will be protected using military-grade encryption: RSA-OAEP 2048 for secure key exchange, AES-GCM 256 for encrypting the content, and RSA-PSS for digitally signing it to guarantee authenticity. Without access to your account’s login credentials (where passwords are hashed using bcrypt, soon to be upgraded to Argon2), decrypting your message would take millions of years, even with super computers. All communications between your device and the API are encrypted with HTTPS (TLS), ensuring top-level security. If you're on a proxy (such as school Wi-Fi), your data remains encrypted at all times between you and the API. No message history is stored on the server.

Please note that we are not able to provide the decrypted message or private key for anyone registered in our database as private keys are encrypted using account passwords which are hashed using secure algorithms that are very difficult to reverse.
`

export class EncryptionProvider {

    visible: boolean = false;
    win: HTMLDivElement;
    currentSearch: string = "";
    currentSelected: number | null = null;
    authProvider: InstanceType<typeof AuthProvider>



    constructor(authProvider: InstanceType<typeof AuthProvider>) {
        this.win = this.createWindow();
        this.hideWindow();
        this.authProvider = authProvider;
        this.injectTab();
        this.refreshAccounts();
        this.searchEvents();
        this.encryptEvent();
        this.messageObserver();

    }

    private hideWindow() {
        this.win.animate(
            [
                { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" },
                { transform: 'translateY(-60%) translateX(-50%)', opacity: "0" }
            ],
            {
                duration: 500,
                easing: "ease-in",
                iterations: 1,
                fill: "forwards"
            }
        )

        setTimeout(() => {
            if (this.win) this.win.style.display = "none";
        }, 500)
    }


    private showWindow() {
        this.win.style.opacity = "0";
        this.win.style.display = "block";
        this.win.animate(
            [
                { transform: 'translateY(-60%) translateX(-50%)', opacity: "0" },
                { transform: 'translateY(-50%) translateX(-50%)', opacity: "1" }
            ],
            {
                duration: 500,
                easing: "ease-out",
                iterations: 1,
                fill: "forwards"
            }
        )

        const messageField: HTMLInputElement | null = this.win.querySelector("#encrypt-message");
        if (messageField == null) return;

        messageField.value = "";
        this.currentSelected = null;
        this.currentSearch = '';

        const selectedP = this.win.querySelector("#selected");
        if (selectedP != null) selectedP.innerHTML = "Selected: <strong>No account selected. Please select an account to encrypt.</strong>";

        const input: HTMLInputElement | null = this.win.querySelector("#encrypt-search");
        if (input != null) input.value='';
        this.refreshAccounts();
    }

    private async injectTab() {
        const btn = await injectTab("Encryption", `<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24">

<title/>

<g id="Complete">

<g id="lock">

<g>

<rect fill="none" height="10" rx="2" ry="2" stroke="var(--colorNeutralForeground3)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" width="16" x="4" y="11"/>

<path d="M16.5,11V8h0c0-2.8-.5-5-4.5-5S7.5,5.2,7.5,8h0v3" fill="none" stroke="var(--colorNeutralForeground3)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>

</g>

</g>

</g>

</svg>`);
        if (btn) {
            btn.addEventListener("click", () => {
                this.visible = !this.visible
                if (this.visible) {
                    this.showWindow();
                } else {
                    this.hideWindow();
                }
            })
        }
    }
    private createWindow() {
        const win = p_stringToElement(ENCRYPTION_UI_WINDOW) as HTMLDivElement;

        document.body.appendChild(win)



        return win
    }

    private refreshAccounts() {
        const list = this.win.querySelector(".encryption-ui-people");
        if (list == null) {
            throw new Error("List not found");
        };
        const selectedP = this.win.querySelector("#selected");
        if (selectedP == null) return;
        list.innerHTML = '';
        fetch(`${API_ENDPOINT}/api/v1/auth/search?search=${this.currentSearch}`, {
            method: 'GET'
        })
            .then(response => response.json())
            .then((data) => {
                if (data.message && data.success == true && data.data) {
                    const resp: { [key: string]: number } = data.data;
                    for (const user in resp) {
                        const id = resp[user];

                        const newEl = p_stringToElement(ENCRYPTION_ACCOUNT);
                        const p = newEl.querySelector("#account-info");
                        const p2 = newEl.querySelector("#account-id");
                        if (p == null || p2 == null) {
                            throw new Error("Account info not found!");
                        };

                        p.textContent = `${user}`;
                        p2.textContent = `ID: ${id}`

                        const selectBtn = newEl.querySelector("#select");
                        if (selectBtn == null) {
                            throw new Error("select btn");
                        }

                        selectBtn.addEventListener("click", () => {
                            this.currentSelected = id;
                            //alert(`Selected ${id}`);
                            selectedP.textContent = `Selected: ${user}/${id}`;
                        })
                        


                        list.appendChild(newEl);
                        newEl.style.opacity = "0";
                        newEl.style.transform = "translateY(-15px)";
                        newEl.animate(
                            [
                                {transform: 'translateY(-15px)', opacity: "0"},
                                {transform: 'translateY(0px)', opacity: "1"}
                            ],
                            {
                                duration: 500,
                                easing: "ease-out",
                                iterations: 1,
                                fill: "forwards"
                            }
                        )
                        console.log(`Added: ${user}`);

                    }
                } else {
                    throw new Error(data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error)
                if (error instanceof Error) {
                    alert(`Error: ${error.message}`)
                } else {
                    alert("Error");
                }

            });
    }

    private searchEvents() {
        const input: HTMLInputElement | null = this.win.querySelector("#encrypt-search");
        if (input == null) return;

        input.addEventListener("input", () => {
            this.currentSearch = input.value;
            this.refreshAccounts();
        })
    }

    private encryptEvent() {
        const encryptBtn = this.win.querySelector("#encrypt-btn");
        if (encryptBtn == null) return;
        const messageField: HTMLInputElement | null = this.win.querySelector("#encrypt-message");
        if (messageField == null) return;

        encryptBtn.addEventListener("click", async () => {
            if (this.currentSelected == null) {
                alert("Please select an account before encrypting!");
                return;
            }
            alert(LONG_YAP);

            const safeTunnel = new SafeTunnel();
            const body = JSON.stringify({
                destination: [this.currentSelected],
                body: messageField.value,
                pwd: await promptAndWait()
            });
            const encryptedBody = await safeTunnel.safeTunnelEncrypt(body);

            fetch(`${API_ENDPOINT}/api/v1/encryption/encrypt`, {
                method: 'POST',
                body: JSON.stringify(encryptedBody),
                headers: {
                    'Authorization': `Bearer ${await this.authProvider.getToken()}`,
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then((data) => {
                    if (data.message && data.success == true && data.data) {
                        if (data.note) {
                            alert(`Note: ${data.note}`);
                        }
                        const finalStr = `[TeamsPlus Secure Encryption][apiteamsplus.pythonanywhere.com]\\\\\\\\${JSON.stringify(data.data)}\\\\\\\\[RSA-OAEP 2048 // AES-GCM 256 // RSA-PSS] - This message has been digitally signed by the sender.`
                        const encryptOutput: HTMLTextAreaElement | null = this.win.querySelector("#encrypt-output");
                        if (encryptOutput) {
                            encryptOutput.value = finalStr;
                        }
                        navigator.clipboard.writeText(finalStr);
                        alert("Copied to clipboard");
                    } else {
                        throw new Error(data.message);
                    }
                })
                .catch((error) => {
                    console.error('Error:', error)
                    if (error instanceof Error) {
                        alert(`Error: ${error.message}`)
                    } else {
                        alert("Error");
                    }

                });
        })
    }

    private isValidEncrypted(str: string) {
        const splitted = str.split("\\\\\\\\");
        if (splitted.length != 3) return false;
        const second = splitted[1];
        try {JSON.parse(second)}
        catch (e) {return false;}
        finally {return true;}
    }

    private async attemptDecrypt(jsonData: {author: number, body: string, iv: string, keys: {[key: number]: string}, signature: string}) {

        const safeTunnel = new SafeTunnel();
        const content = JSON.stringify({
            body: jsonData["body"],
            key: jsonData["keys"],
            iv: jsonData["iv"],
            signature: jsonData["signature"],
            pwd: await promptAndWait(),
            author: jsonData["author"]
        });
        fetch(`${API_ENDPOINT}/api/v1/encryption/decrypt`, {
            method: 'POST',
            body: JSON.stringify(await safeTunnel.safeTunnelEncrypt(content)),
            headers: {
                'Authorization': `Bearer ${await this.authProvider.getToken()}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(async (a) => {

                const data = await safeTunnel.safeTunnelDecrypt(a.ct, a.iv);

                if (data.message && data.success == true && data.data) {
                    alert(`Message was: ${data.data}`);
                } else {
                    throw new Error(data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error)
                if (error instanceof Error) {
                    alert(`Error: ${error.message}`)
                } else {
                    alert("Error");
                }

            });
    }

    private onMessage(element: HTMLElement) {
        const subDiv: HTMLDivElement | null = element.querySelector<HTMLElement>('[id^="content-"]') as HTMLDivElement | null;
        if (subDiv == null) {
            console.log("Mut observer warn: content- element not found under message");
            return;
        }
        console.log(subDiv.ariaLabel);
        const message: string = subDiv.ariaLabel || "";
        const isValid = this.isValidEncrypted(subDiv.ariaLabel || "");
        // Now do stuff
        if (isValid && subDiv.querySelector("#decrypt-btn") == null) {
            const newBtn = p_stringToElement(DECRYPT_BUTTON);
            subDiv.appendChild(newBtn);

            newBtn.addEventListener("click", () => {
                try {

                    const splitted = message.split("\\\\\\\\");
                    const theActualMessage = splitted[1];

                    this.attemptDecrypt(JSON.parse(theActualMessage));
                } catch (e) {
                    alert(`Failed: ${e}`);
                }

            })
        }


    }

    private messageObserver() {
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (
                        node instanceof HTMLElement &&
                        node.dataset.tid === 'chat-pane-message'
                    ) {
                        console.log('New chat message detected:', node);
                        this.onMessage(node);

                        
                        

                    }

                    if (node instanceof HTMLElement || node instanceof DocumentFragment) {
                        const wrappers = (node as HTMLElement).querySelectorAll('[data-tid="chat-pane-message"]');

                        wrappers.forEach((wrapper, index) => this.onMessage(wrapper as HTMLElement));

                    }
                }
            }
        });
        console.log("Starting Mutation observer on Body!");
        observer.observe(document.body, { childList: true, subtree: true });
    }

}
import { p_stringToElement } from "../utils";
import { API_ENDPOINT } from "../config";
import { SafeTunnel } from "./safeTunnel";
const LOGIN_CONTAINER = `
<div class="main-login-container">
    <div class="rel">
        <div class="loader-container" id="loader" style="display: none;">
            <div class="rel">
                <span class="loader login-loader"></span>
            </div>

        </div>
        <form action="">
            <h3 class="login-title">Login</h3>
            <p class="login-title">An action requires you to login to your account.</p>
            <div class="login-align-center">
                <input type="text" name="username" id="loginUsername" autocomplete="username" placeholder="Username" required>
                <input type="password" name="password" id="loginPassword" placeholder="Password" required>
                <button type="submit" class="login-btn-submit normal-button" id="submitBtn">Submit</button>
                <a href="https://apiteamsplus.pythonanywhere.com/" target="_blank">Visit website to register</a>
            </div>
        </form>
    </div>

</div>
`;



export class AuthProvider {

    currentToken: string | null = null;
    success: boolean | null = null;
    loginContainer: HTMLDivElement | null = null;
    awaitAuth: boolean = false;

    constructor() {
        this.p_createLoginContainer();
        this.p_initButtons();
        this.p_asyncInit();
    }

    private async p_asyncInit() {
        this.currentToken = await this.p_loadToken();
    }

    private async p_loadToken() {
        return (await chrome.storage.local.get(["teamsplusToken"])).teamsPlusToken
    }
    private p_saveToken() {
        chrome.storage.local.set({ "teamsplusToken": this.currentToken });
    }
    private p_createLoginContainer() {
        if (this.loginContainer == null) {
            this.loginContainer = p_stringToElement(LOGIN_CONTAINER) as HTMLDivElement;
            this.loginContainer.style.display = "none";

            document.body.appendChild(this.loginContainer);
        } else {
            console.error("Login container already exists!");
        }
    }
    private p_showLoginContainer() {
        if (this.loginContainer) {
            this.loginContainer.style.opacity = "0";
            this.loginContainer.style.display = "block";

            // Show animation

            this.loginContainer.animate(
                [
                    {transform: 'translateY(-65%) translateX(-50%)', opacity: "0", filter: "blur(10px)"},
                    {transform: 'translateY(-50%) translateX(-50%)', opacity: "1", filter: "blur(0px)"}
                ],
                {
                    duration: 1000,
                    easing: "ease-out",
                    iterations: 1,
                    fill: "forwards"
                  }
            )
        } else {
            console.error("Login container not found!");
        }
    }
    private p_hideLoginContainer() {
        if (this.loginContainer) {

            // Animate

            this.loginContainer.animate(
                [
                    {opacity: "1", filter: "blur(0px)", transform: 'translateY(-50%) translateX(-50%)'},
                    {opacity: "0", filter: "blur(10px)", transform: 'translateY(-65%) translateX(-50%)'}
                ],
                {
                    duration: 1000,
                    easing: "ease-in",
                    iterations: 1,
                    fill: "forwards"
                  }
            )
            setTimeout(() => {
                if (this.loginContainer == null) return;
                this.loginContainer.style.display = "none";
            }, 1000)
            



        } else {
            console.error("Login container not found!");
        }
    }

    private p_showLoader() {
        if (this.loginContainer == null) return;
        const loader: HTMLDivElement | null = this.loginContainer.querySelector("#loader");
        if (loader) {
            loader.style.display = "block";
        }
    }

    private p_hideLoader() {
        if (this.loginContainer == null) return;
        const loader: HTMLDivElement | null = this.loginContainer.querySelector("#loader");
        if (loader) {
            loader.style.display = "none";
        }
    }


    private p_initButtons() {
        if (this.loginContainer == null) return;
        const submitBtn = this.loginContainer.querySelector("#submitBtn");
        if (submitBtn) {
            submitBtn.addEventListener("click", async (event) => {
                console.log("The button has been clicked!");
                event.preventDefault();
                if (this.loginContainer == null) {
                    console.error("no login container")
                    return;
                };
                if (this.awaitAuth == false) {
                    console.error("not awaiting auth");
                    return;
                };

                this.success = null;
                this.currentToken = null;



                const usernameElement: HTMLInputElement | null = this.loginContainer.querySelector("#loginUsername");
                const passwordElement: HTMLInputElement | null = this.loginContainer.querySelector("#loginPassword");
                if (usernameElement == null || passwordElement == null) {
                    console.error("Username / password element not found");
                    return
                };

                // Post
                this.p_showLoader();
                const safeTunnel = new SafeTunnel();
                const body = JSON.stringify({
                    username: usernameElement.value,
                    password: passwordElement.value,
                    transfer: true // Tells API to transfer back token in .data field
                });
                const encrypted = await safeTunnel.safeTunnelEncrypt(body);

                fetch(`${API_ENDPOINT}/api/v1/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(encrypted)
                })
                    .then(response => response.json())
                    .then((data) => {
                        if (data.message && data.success == true && data.data) {
                            this.currentToken = data.data;
                            this.p_saveToken();
                            //this.currentToken =" yay";
                            this.p_hideLoader();
                            //alert("OK");
                        } else {
                            this.p_hideLoader();
                            throw new Error("not OK");
                        }
                    })
                    .catch((error) => {
                        this.p_hideLoader();
                        console.error('Error:', error)
                        if (error instanceof Error) {
                            alert(`Error: ${error.message}`)
                        } else {
                            alert("Error");
                        }

                    });
            })
        } else {
            console.error("Oneor many elements null")
        }
    }

    private waitUntilToken(checkInterval = 100) {
        this.awaitAuth = true;
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.currentToken != null || this.success || null) {
                    clearInterval(interval);
                    this.success = null;
                    this.awaitAuth = false;
                    resolve(this.currentToken);

                }
            }, checkInterval);
        });
    }

    async getToken() {
        if (this.currentToken) {
            console.log("Found token! returning");
            return this.currentToken;
        }
        console.log("No token! creating new login container");

        this.p_createLoginContainer();
        this.p_showLoginContainer();
        if (this.loginContainer == null) return;
        this.loginContainer.style.display = "block";

        await this.waitUntilToken();
        this.p_hideLoginContainer();
        const tok = this.currentToken;
        if (tok == null) {
            console.error("Still no token");
        }

        return tok;
    }

}
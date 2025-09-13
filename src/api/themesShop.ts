import { waitForElement, p_stringToElement } from "../utils"
import { AuthProvider } from "./authorizationProvider";
import { API_ENDPOINT } from "../config";
import { search } from "node-emoji";
import { ThemeManager } from "../popup/themes";
import { injectTab } from "../ui/tabInject";

const BUTTON_ELEMENT_HTML = `
<button id="themeShopBtn">Shop</button>
`;
const THEME_CARD_LISTING = `
<div class="listing-card">
    <h3 class="theme-name">Theme</h3>
    <p class="theme-description">This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look very pretty! This theme will make your Teams look
        very pretty!</p>
    <div class="actions">
        <button class="theme-install" id="theme-install">Install</button>
        <button class="star" id="star-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none" class="star-icon">
                <path d="M11.2691 4.41115C11.5006 3.89177 11.6164 3.63208 11.7776 3.55211C11.9176 3.48263 12.082 3.48263 12.222 3.55211C12.3832 3.63208 12.499 3.89177 12.7305 4.41115L14.5745 8.54808C14.643 8.70162 14.6772 8.77839 14.7302 8.83718C14.777 8.8892 14.8343 8.93081 14.8982 8.95929C14.9705 8.99149 15.0541 9.00031 15.2213 9.01795L19.7256 9.49336C20.2911 9.55304 20.5738 9.58288 20.6997 9.71147C20.809 9.82316 20.8598 9.97956 20.837 10.1342C20.8108 10.3122 20.5996 10.5025 20.1772 10.8832L16.8125 13.9154C16.6877 14.0279 16.6252 14.0842 16.5857 14.1527C16.5507 14.2134 16.5288 14.2807 16.5215 14.3503C16.5132 14.429 16.5306 14.5112 16.5655 14.6757L17.5053 19.1064C17.6233 19.6627 17.6823 19.9408 17.5989 20.1002C17.5264 20.2388 17.3934 20.3354 17.2393 20.3615C17.0619 20.3915 16.8156 20.2495 16.323 19.9654L12.3995 17.7024C12.2539 17.6184 12.1811 17.5765 12.1037 17.56C12.0352 17.5455 11.9644 17.5455 11.8959 17.56C11.8185 17.5765 11.7457 17.6184 11.6001 17.7024L7.67662 19.9654C7.18404 20.2495 6.93775 20.3915 6.76034 20.3615C6.60623 20.3354 6.47319 20.2388 6.40075 20.1002C6.31736 19.9408 6.37635 19.6627 6.49434 19.1064L7.4341 14.6757C7.46898 14.5112 7.48642 14.429 7.47814 14.3503C7.47081 14.2807 7.44894 14.2134 7.41394 14.1527C7.37439 14.0842 7.31195 14.0279 7.18708 13.9154L3.82246 10.8832C3.40005 10.5025 3.18884 10.3122 3.16258 10.1342C3.13978 9.97956 3.19059 9.82316 3.29993 9.71147C3.42581 9.58288 3.70856 9.55304 4.27406 9.49336L8.77835 9.01795C8.94553 9.00031 9.02911 8.99149 9.10139 8.95929C9.16534 8.93081 9.2226 8.8892 9.26946 8.83718C9.32241 8.77839 9.35663 8.70162 9.42508 8.54808L11.2691 4.41115Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            <span>30k</span>
        </button>
    </div>
</div>
`;

const THEME_SHOP = `
<div class="main-container">
    <div class="top-navbar">
        <input type="text" name="" id="container-search" class="container-search" placeholder="Search" autocomplete="off">
        <button class="container-search-submit" id="search-submit">Search</button>
        <p class="container-n-points">0 coins</p>
    </div>
    <div class="listings">
        <div class="listings-loader-parent" id="listings-loader">
            <span class="listings-loader"></span>
        </div>
    </div>
</div>
`;

export class ThemesShopHandler {

    parser: DOMParser;
    themeShopUI: HTMLDivElement | null = null;
    shopUiVisible: boolean = false;
    authProvider: AuthProvider;
    currentSearchQuery: string;
    themeProvider: InstanceType<typeof ThemeManager>;

    constructor(themeProvider: InstanceType<typeof ThemeManager>) {

        this.parser = new DOMParser();
        this.authProvider = new AuthProvider();
        this.currentSearchQuery = '';
        this.themeProvider = themeProvider;

        this.p_init();


    }



    private async p_injectButton() {
        // Get the thing element and inject a poor button in it

        /*const element: HTMLDivElement = await waitForElement('[data-tid="titlebar-end-slot"]') as HTMLDivElement;

        console.log("Found button element");

        const buttonElement = p_stringToElement(BUTTON_ELEMENT_HTML);



        element.appendChild(buttonElement);*/

        const buttonElement = await injectTab("Browse themes", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--colorNeutralForeground3)" height="24px" width="24px" version="1.1" id="XMLID_269_" viewBox="0 0 24 24" xml:space="preserve">
<g id="shop-cart">
	<g>
		<circle cx="9" cy="21" r="2"/>
	</g>
	<g>
		<circle cx="19" cy="21" r="2"/>
	</g>
	<g>
		<path d="M21,18H7.2l-4-16H0V0h4.8l0.8,3H24l-3.2,11H8.3l0.5,2H21V18z M7.8,12h11.5l2-7H6L7.8,12z"/>
	</g>
</g>
</svg>`);
        if (buttonElement == null) return;
        buttonElement.addEventListener("click", () => {
            if (this.shopUiVisible) {
                this.shopUiVisible = false;

                this.p_hideThemeShopUI();
            } else {
                this.shopUiVisible = true;

                this.p_showThemeShopUI();
            }
        })
        console.log("Injected button");
    }

    private loaderState(visibility: boolean) {
        if (this.themeShopUI == null) return;
        const loader: HTMLSpanElement | null = this.themeShopUI.querySelector("#listings-loader");
        if (loader == null) return;

        if (visibility) {
            loader.style.display = "block";
            loader.animate(
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
        } else {
            loader.animate(
                [
                    {transform: 'translateY(0px)', opacity: "1"},
                    {transform: 'translateY(-15px)', opacity: "0"}
                ],
                {
                    duration: 500,
                    easing: "ease-in",
                    iterations: 1,
                    fill: "forwards"
                }
            )
            setTimeout(() => {
                loader.style.display = "none";
            }, 500);
        }
    }

    private p_didIstarThis(name: string) {
        
        return new Promise((resolve, reject) => {
            if (this.authProvider.currentToken == null) {
                reject("no token");
                return;
            };
            fetch(`${API_ENDPOINT}/api/v1/themes/wait_did_i_star_this?name=${name}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authProvider.currentToken}`
                }
            })
                .then(response => {
                    console.log(response);
                    return response.json();
                })
                .then(data => {
                    if (data.success == null || data.success == false) {
                        throw new Error("Success field not found or unsuccessfull");
                    }
                    if (data.message == null) {
                        throw new Error("No message field found");
                    }
                    if (data.data == null) {
                        throw new Error("No data field found");
                    }

                    resolve(data.data);

                })
                .catch(error => {
                    console.error('Error:', error);
                    reject(error);
                });
        })

    }

    private async star(name: string) {
        fetch(`${API_ENDPOINT}/api/v1/themes/star`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                token: await this.authProvider.getToken()
            })
        })
            .then(response => {
                console.log(response);
                return response.json();
            })
            .then(data => {
                if (data.success == null || data.success == false) {
                    throw new Error("Success field not found or unsuccessfull");
                }
                if (data.message == null) {
                    throw new Error("No message field found");
                }
                console.log("Liked!");
                this.p_refreshListings(this.currentSearchQuery);

            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    private async changeIconStroke(name: string, starSvg: SVGSVGElement) {
        try {
            const isStarred = await this.p_didIstarThis(name)
            if (isStarred == true) {
                starSvg.classList.add("starred");
                console.log("Starred");
            } else {
                console.log("Not starred");
            }
        } catch (e) {
            console.error("Failed", e);
        }
    }

    private p_createCard(name: string, desc: string, data: string, author: string, stars: number) {
        const element = p_stringToElement(THEME_CARD_LISTING) as HTMLDivElement;

        const themeNameEl = element.querySelector(".theme-name");
        const themeDescEl = element.querySelector(".theme-description");
        const starsEl = element.querySelector("span");
        const starBtn: HTMLButtonElement | null = element.querySelector("#star-btn");
        const themeInstallBtn: HTMLButtonElement | null = element.querySelector("#theme-install");


        if (themeNameEl == null || themeDescEl == null || starsEl == null || starBtn == null ||themeInstallBtn == null) return;
        const starsSvg = starBtn.querySelector("svg");
        if (starsSvg == null) return;
        themeNameEl.textContent = name;
        themeDescEl.textContent = desc;
        starsEl.textContent = stars.toString();

        this.changeIconStroke(name, starsSvg);

        starBtn.addEventListener("click", async () => {
            console.log("The button got clicked!");
            const tok = await this.authProvider.getToken()
            if (!tok) {
                alert("You must be logged in to do this");
                return;
            }

            this.star(name);


        })

        themeInstallBtn.addEventListener("click", () => {
            try {
                const parsed = this.themeProvider.p_isThemeValid(data);
                if (parsed) {

                    let counter = 1;
                    const baseName = parsed.name;
                    let newName = baseName;

                    while (this.themeProvider.currentThemes[newName]) {
                        newName = `${baseName} (${counter})`;
                        counter++;
                    }


                    this.themeProvider.addTheme(newName, data);
                    alert("Added theme");
                } else {
                    alert('Failed to parse theme');
                }              
            } catch (e) {
                console.error("Failed to add theme: ", e);
                alert(`Failed to add theme: ${e}`);
            }

        })



        return element;
    }

    private p_refreshListings(searchQuery: string) {
        if (this.themeShopUI == null) return;
        const listingsElement: HTMLDivElement | null = this.themeShopUI.querySelector(".listings");
        if (listingsElement == null) return;

        listingsElement.innerHTML = '';

        // Fetch
        this.loaderState(true);
        fetch(`${API_ENDPOINT}/api/v1/themes/get?search=${searchQuery}`)
            .then(response => response.json())
            .then((data: { data: {[key: string]: { name: string, desc: string, author: string, data: string, stars: number } }}) => {
                console.log('Data:', data["data"]);

                for (const themeName in data["data"]) {
                    const d = data["data"][themeName];

                    const a = this.p_createCard(d.name, d.desc, d.data, d.author, d.stars);
                    if (a) {
                        a.style.opacity = "0";
                        a.style.transform = "translateY(-15px)";

                        listingsElement.appendChild(a);

                        // Do the anmimation
                        a.animate(
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
                    }
                }

                this.loaderState(false);
            })
            .catch(error => {
                this.loaderState(false);
                console.error('Error:', error);
                alert("Error");
            });
    }

    private async p_hideThemeShopUI() {
        if (this.themeShopUI) {
            // Animatoin

            this.themeShopUI.animate(
                [
                    {transform: 'translateY(-50%) translateX(-50%)', opacity: "1"},
                    {transform: 'translateY(-60%) translateX(-50%)', opacity: "0"}
                ],
                {
                    duration: 500,
                    easing: "ease-in",
                    iterations: 1,
                    fill: "forwards"
                  }
            )
            setTimeout(() => {
                if (this.themeShopUI == null) return;
                this.themeShopUI.style.display = "none";
            }, 500)
            
        }
    }
    private async p_showThemeShopUI() {
        if (this.themeShopUI) {
            this.themeShopUI.style.display = "flex";
            this.themeShopUI.style.opacity = "0";

            // Animation

            this.themeShopUI.animate(
                [
                    {transform: 'translateY(-65%) translateX(-50%)', opacity: "0"},
                    {transform: 'translateY(-50%) translateX(-50%)', opacity: "1"}
                ],
                {
                    duration: 500,
                    easing: "ease-out",
                    iterations: 1,
                    fill: "forwards"
                  }
            )

            this.p_refreshListings(this.currentSearchQuery);
        }
    }

    private async p_injectUi() {

        this.themeShopUI = p_stringToElement(THEME_SHOP) as HTMLDivElement;
        document.body.appendChild(this.themeShopUI);

        // Hide it

        this.p_hideThemeShopUI();
    }

    private async p_searchBar() {
        if (this.themeShopUI == null) return;
        const searchBar: HTMLInputElement | null = this.themeShopUI.querySelector("#container-search");
        const submitBtn: HTMLButtonElement | null = this.themeShopUI.querySelector("#search-submit");

        if (searchBar == null || submitBtn == null) return;

        submitBtn.addEventListener("click", () => {
            this.currentSearchQuery =  searchBar.value;
            this.p_refreshListings(this.currentSearchQuery);
        })

        searchBar.addEventListener("input", () => {
            this.currentSearchQuery =  searchBar.value;
            this.p_refreshListings(this.currentSearchQuery);
        })
    }

    private async p_init() {
        this.p_injectButton();
        this.p_injectUi();
        this.p_searchBar();

    }
}
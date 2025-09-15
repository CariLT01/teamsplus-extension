import { p_stringToElement } from "../utils";

const ADVANCED_BUTTON_HTML = `
            <img src="https://www.svgrepo.com/show/509956/gear.svg" alt="" class="btn-with-icon-img">
            <span>Create or edit theme</span>
`;

const BACK_BUTTON_HTML = `
            <img src="https://www.svgrepo.com/show/533593/arrow-left.svg" alt="" class="btn-with-icon-img">
            <span>Back</span>
`;

const spinner: HTMLDivElement = document.querySelector("#spinner") as HTMLDivElement;

function animate_opacity(visibility: boolean, element: HTMLDivElement) {
    if (visibility) {
        element.animate(
            [
                { opacity: "0" },
                { opacity: "1" }
            ],
            {
                duration: 300,
                iterations: 1,
                fill: 'forwards'
            }
        );
    } else {
        element.animate(
            [
                { opacity: "1" },
                { opacity: "0" }
            ],
            {
                duration: 300,
                iterations: 1,
                fill: 'forwards'
            }
        );
    }

}

export function popupUI_init(advancedLoadCallback: () => Promise<void>) {
    const modeSwitchBtn: HTMLButtonElement | null = document.querySelector("#mode-switch");
    const mainDiv: HTMLDivElement | null = document.querySelector(".main");
    const advancedDiv: HTMLDivElement | null = document.querySelector(".advanced");
    if (modeSwitchBtn == null || mainDiv == null || advancedDiv == null) return;

    let advancedMode = false;

    // Hide the advanced tab

    advancedDiv.style.display = "none";

    modeSwitchBtn.addEventListener("click", () => {
        advancedMode = !advancedMode;
        if (advancedMode) {
            //advancedDiv.style.display = "block";
            //mainDiv.style.display = "none";

            animate_opacity(false, mainDiv);
            animate_opacity(true, spinner);
            setTimeout(async () => {
                
                await advancedLoadCallback();
                mainDiv.style.display = "none";
                advancedDiv.style.display = 'block';
                
                animate_opacity(true, advancedDiv);
                animate_opacity(false, spinner);
            }, 0);

            modeSwitchBtn.innerHTML = BACK_BUTTON_HTML;
        } else {
            animate_opacity(false, advancedDiv);
            animate_opacity(true, spinner)
            setTimeout(() => {
                advancedDiv.style.display = "none";
                mainDiv.style.display = 'flex';
                animate_opacity(true, mainDiv);
                animate_opacity(false, spinner)
            }, 0);

            modeSwitchBtn.innerHTML = ADVANCED_BUTTON_HTML;
        }
    })
}
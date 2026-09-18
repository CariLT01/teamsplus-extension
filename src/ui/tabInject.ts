import { p_stringToElement, waitForElement } from "../utils"

const TAB_HTML = `


<div>
    <div class="injected-parent-div">
        <button type="button" class="injected-parent-button">
            <span class="injected-tab-upper-span">
              <div class=".injected-tab-div2">
                <div class="injected-tab-upper-div"></div>
                <span class="injected-tab-span">Delayed Send</span>
              </div>
            </span>
        </button>
    </div>
</div>
`

type TabInformation = {
    button: HTMLButtonElement;
};

let handlerStarted = false;
const tabs: TabInformation[] = [];

async function tabHandler() {

    if (handlerStarted) return;
    handlerStarted = true;

    setInterval(async () => {
        for (const tab of tabs) {
            if (!document.body.contains(tab.button)) {
                console.warn("Tab reinjection...");

                const parent = await waitForElement('[role="navigation"]');
                if (!parent) {
                    continue;
                }

                parent.appendChild(tab.button);
            } else {
                console.log("Tab: ", tab.button, " is found in document.body!");
            }
        }
    }, 1000);
}


export async function injectTab(tabName: string, svgSrc: string): Promise<HTMLButtonElement | null> {
    const parent = await waitForElement('[role="navigation"]');
    const newElement = p_stringToElement(TAB_HTML);

    console.log(newElement);

    const span: HTMLSpanElement | null = newElement.querySelector(".injected-tab-span");
    const div: HTMLDivElement | null = newElement.querySelector(".injected-tab-upper-div");
    //const img: HTMLImageElement | null = newElement.querySelector(".injected-tab-img");
    const btn: HTMLButtonElement | null = newElement.querySelector("button");
    if (span == null || btn == null || div == null) {
        throw new Error("Span or img or btn not found in injected tab");
    }

    const svg: SVGSVGElement = p_stringToElement(svgSrc) as unknown as SVGSVGElement;
    svg.classList.add("injected-tab-img");
    div.prepend(svg)



    span.textContent = tabName;

    parent.appendChild(newElement);

    tabs.push({
        button: btn
    });

    tabHandler();

    return btn
}
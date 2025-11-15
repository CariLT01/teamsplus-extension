import { injectTab } from "../ui/tabInject";
import { p_stringToElement } from "../utils";
import { Game } from "./snake/game";

const SNAKE_GAME_HTML = `
    <div class="snake">
        <button type="button">Close</button>
        <div class="containement">
        <canvas id="game"></canvas>
    <div class="information" id="info">
        <h1>TeamsPlus <s style="color:rgba(255,255, 255,0.3);font-size: small;">gambling</s> snake game - Temporary
            settings menu</h1>
        <p>Game size</p><button id="small">SMall</button> <button id="medium">Medium</button> <button
            id="large">Large</button> <button id="largest">Largest</button>
        <p>Impossible difficulty (double snakes)</p>
        <p>Control one with arrow keys, control the other with WSAD.</p><input type="checkbox" name=""
            id="double-snakes"><br>
        <p>Number of apples</p><input type="range" name="" id="apples" min="1" max="10" value="1"><br><button
            id="begin">Begin</button>
    </div>
    <div class="score"><span id="score">Score: 0</span></div>
        </div>
    </div>
`;
const SNAKE_TAB_SVG = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="24px" width="24px" version="1.1" id="_x32_" viewBox="0 0 512 512" xml:space="preserve" fill="var(--colorNeutralForeground3)">
<style type="text/css">
	.st0{fill:var(--colorNeutralForeground3);}
</style>
<g>
	<path class="st0" d="M506.705,405.481C509.495,406.787,503.595,403.971,506.705,405.481L506.705,405.481z"/>
	<path class="st0" d="M506.705,405.481c-5.599-2.719-21.469,17.541-24.916,20.58c-10.414,9.197-23.086,17.63-37.393,18.465   c-33.091,1.928-45.372-33.918-54.578-58.745c-21.611-57.857-68.085-116.461-137.378-83.111   c-29.2,14.058-47.718,41.782-64.05,68.609c-10.362,16.99-26.374,54.605-49.94,56.186c-29.928,2.008-47.914-27.272-45.088-54.365   c3.199-30.701,27.333-52.828,49.086-72.164c45.675-40.591,93.161-73.026,107.592-135.716   c14.751-64.139-16.012-132.446-80.702-153.195c-23.94-7.669-63.837-28.942-102.421,14.315c-65.97,73.932-10.006,66.645,9.846,65.97   c66.734-2.275,95.08,10.281,85.696,45.506c-3.038,11.374-9.81,23.024-16.474,31.128c-4.266,5.545-22.802,22.996-31.012,30.132   c-18.714,16.27-37.676,32.354-54.898,50.224C28.033,282.525,4.307,322.761,2.761,369.972   C-0.225,460.627,96.419,548.2,184.924,496.679c41.782-24.322,56.71-71.16,79.903-110.534c9.668-16.431,27.564-37.801,47.789-21.212   c16.776,13.845,25.344,37.384,35.544,55.964c19.55,35.597,53.05,68.218,97.551,59.341c21.362-4.265,39.294-18.607,50.687-36.841   C499.277,438.777,515.538,409.613,506.705,405.481z"/>
</g>
</svg>`;

export class SnakeGame {

    private isVisible: boolean = false;
    private snakeGame!: Game;
    window: HTMLDivElement;

    constructor() {
        this.window = p_stringToElement(SNAKE_GAME_HTML) as HTMLDivElement;

        this.window.style.display = "none";
        document.body.appendChild(this.window);


        // Inject the bundle





        this.asyncInit();
    }

    private async asyncInit() {
        try {
            const gameEl = await (async () => { while (!document.querySelector("#game")) await new Promise(r => setTimeout(r, 50)); return document.querySelector("#game"); })();
            this.snakeGame = new Game();
            this.snakeGame.setVisibility(false);
        } catch (e) {
            console.error("Failed to create an instance of SnakeGame: ", e);
        }


        //const buttonElement = await (injectTab("Snake", SNAKE_TAB_SVG)) as HTMLButtonElement;
        const buttonElements = await window.teamsPlusAppsManager.addAppAndGetButton("Snake", "https://www.svgrepo.com/show/296787/snake.svg");
        buttonElements.forEach(buttonElement => {
            buttonElement.addEventListener("click", () => {
                this.isVisible = !this.isVisible;
                if (this.isVisible) {
                    this.window.style.display = "block";
                    this.snakeGame.setVisibility(true);

                    const iframe = this.window.querySelector("iframe") as HTMLIFrameElement;
                    iframe.src = chrome.runtime.getURL("pages/snake/index.html");

                } else {
                    this.window.style.display = "none";
                    this.snakeGame.setVisibility(false);
                }
            });
        })

    }
}
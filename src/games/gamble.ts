import confetti from 'canvas-confetti';
import { p_stringToElement } from "../utils";
import { Audio } from "./soundEngine";
import { waitForElement } from '../utils';
import { injectTab } from '../ui/tabInject';

const BUTTON_ELEMENT_HTML = `
<button id="gambleGameButton">Game</button>
`;

const GAMBLING_GAME_HTML = `
        <div class="window">
        <img class="window-background" src="assets/gamble_bg_normal.png">
        <div class="counters">
            <div class="counter-container" id="counter0">
                <div id="counter" class="counter" data-counter-id="0">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
            <div class="counter-container "  id="counter1">
                <div id="counter " class="counter " data-counter-id="1">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
            <div class="counter-container "  id="counter2">
                <div id="counter " class="counter " data-counter-id="2">
                    <img src="assets/digit0.png" alt="0" class="digit" data-number="0">
                    <img src="assets/digit1.png" alt="1" class="digit" data-number="1">
                    <img src="assets/digit2.png" alt="2" class="digit" data-number="2">
                    <img src="assets/digit3.png" alt="3" class="digit" data-number="3">
                    <img src="assets/digit4.png" alt="4" class="digit" data-number="4">
                    <img src="assets/digit5.png" alt="5" class="digit" data-number="5">
                    <img src="assets/digit6.png" alt="6" class="digit" data-number="6">
                    <img src="assets/digit7.png" alt="7" class="digit" data-number="7">
                    <img src="assets/digit8.png" alt="8" class="digit" data-number="8">
                    <img src="assets/digit9.png" alt="9" class="digit" data-number="9">
                </div>
            </div>
        </div>
        <button id="roll">Roll</button>
        <img src="assets/gamble_handle.png" alt="" class="handle-img">

    </div>
`;

const DIGITS = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
]
const DigitToPicture: { [key: number]: string } = {
    0: "assets/digit0.png",
    1: "assets/digit1.png",
    2: "assets/digit2.png",
    3: "assets/digit3.png",
    4: "assets/digit4.png",
    5: "assets/digit5.png",
    6: "assets/digit6.png",
    7: "assets/digit7.png",
    8: "assets/digit8.png",
    9: "assets/digit9.png",
}
const BgPicture = "assets/digitBg.png";



export class GamblingGame {

    windowElement: HTMLImageElement;
    currentDigits: { [key: number]: number };

    audio = new Audio(new AudioContext());
    placeAudio = new Audio(new AudioContext());
    loseAudio = new Audio(new AudioContext());
    winAudio = new Audio(new AudioContext());
    rolling = false;
    windowVisible = false;

    constructor() {

        // Initialize the variables
        this.currentDigits = {};

        // Create the fucking window
        this.windowElement = p_stringToElement(GAMBLING_GAME_HTML) as HTMLImageElement;

        // Put the fucking window in the fucking body
        document.body.appendChild(this.windowElement);
        // Hide it
        this.windowVisiblity(this.windowVisible);
        this.p_fixImages();
        this.onLoad();
        this.p_injectButton();


    }

    private async p_fixImages() {
        for (let i = 0; i < 10; i++) {
            const selector = `[data-number="${i}"]`;
            const elements: NodeListOf<HTMLImageElement> = this.windowElement.querySelectorAll(selector);

            for (const element of elements) {
                if (element instanceof HTMLImageElement) {

                    const url = chrome.runtime.getURL(DigitToPicture[i]);
                    console.log(`Fix url: ${url}`);
                    element.src = url;

                }
            }
        }
        //Backgrounds

        const backgrounds: NodeListOf<HTMLDivElement> = this.windowElement.querySelectorAll(".counter");
        for (const element of backgrounds) {
            const url = chrome.runtime.getURL(BgPicture);

            console.log("Fix background on: ", element);

            element.style.backgroundImage = `url(${url})`;
        }

        // Window background
        const img: HTMLImageElement = this.windowElement.querySelector(".window-background") as HTMLImageElement;
        const counters: HTMLDivElement = this.windowElement.querySelector(".counters") as HTMLDivElement;
        img.src = chrome.runtime.getURL("assets/gamble_bg_normal.png");
        const img2: HTMLImageElement = this.windowElement.querySelector(".handle-img") as HTMLImageElement;
        img2.src = chrome.runtime.getURL("assets/gamble_handle.png");
    }

    private async p_injectButton() {
        // Get the thing element and inject a poor button in it


        /*const buttonElement = await injectTab("Game", `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Icons" viewBox="0 0 32 32" xml:space="preserve" width="24px" height="24px" fill="var(--colorNeutralForeground3)">
<style type="text/css">
    .st0{fill:none;stroke:#000000;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;}
</style>
<g>
    <path d="M6,13H4c-0.6,0-1,0.4-1,1c0,0.5,0.4,0.9,0.8,1C3.3,15.9,3,16.9,3,18c0,0.6,0.4,1,1,1s1-0.4,1-1c0-1,0.4-2,1.1-2.7l0.6-0.6   C7,14.4,7.1,14,6.9,13.6C6.8,13.2,6.4,13,6,13z"/>
    <path d="M14,13h-2c-0.6,0-1,0.4-1,1c0,0.5,0.4,0.9,0.8,1c-0.5,0.9-0.8,1.9-0.8,3c0,0.6,0.4,1,1,1s1-0.4,1-1c0-1,0.4-2,1.1-2.7   l0.6-0.6c0.3-0.3,0.4-0.7,0.2-1.1C14.8,13.2,14.4,13,14,13z"/>
    <path d="M20,19c0.6,0,1-0.4,1-1c0-1,0.4-2,1.1-2.7l0.6-0.6c0.3-0.3,0.4-0.7,0.2-1.1C22.8,13.2,22.4,13,22,13h-2c-0.6,0-1,0.4-1,1   c0,0.5,0.4,0.9,0.8,1c-0.5,0.9-0.8,1.9-0.8,3C19,18.6,19.4,19,20,19z"/>
    <path d="M29,2c-1.7,0-3,1.3-3,3c0,1.3,0.8,2.4,2,2.8V18h-2v-7V9c0-3.9-3.1-7-7-7H7C3.1,2,0,5.1,0,9v2v10v8c0,0.6,0.4,1,1,1h24   c0.6,0,1-0.4,1-1v-8v-1h3c0.6,0,1-0.4,1-1V7.8c1.2-0.4,2-1.5,2-2.8C32,3.3,30.7,2,29,2z M10,12h6v8h-6V12z M2,12h6v8H2V12z M17,26   H9c-0.6,0-1-0.4-1-1s0.4-1,1-1h8c0.6,0,1,0.4,1,1S17.6,26,17,26z M24,20h-6v-8h6V20z"/>
</g>
</svg>`);*/
        const buttonElements = await window.teamsPlusAppsManager.addAppAndGetButton("Fun Minigame", "https://www.svgrepo.com/show/402695/slot-machine.svg");
        buttonElements.forEach((buttonElement) => {
            buttonElement.addEventListener("click", () => {
                if (this.windowVisible == true) {
                    this.windowVisible = false;
                    this.windowVisiblity(false);
                } else if (this.windowVisible == false) {
                    this.windowVisible = true;
                    this.windowVisiblity(true);
                }
            });
        })



        console.log("Injected button");
    }

    private windowVisiblity(state: boolean): undefined {
        if (state == true) {
            this.windowElement.style.display = "block";
            this.windowElement.style.opacity = "0";

            this.windowElement.animate(
                [
                    { opacity: "0", filter: "blur(10px)" },
                    { opacity: "1", filter: "blur(0px)" }
                ],
                {
                    duration: 1000,
                    easing: "ease-out",
                    iterations: 1,
                    fill: "forwards"
                }
            )
        } else if (state == false) {

            this.windowElement.animate(
                [
                    { opacity: "1", filter: "blur(0px)" },
                    { opacity: "0", filter: "blur(10px)" }
                ],
                {
                    duration: 1000,
                    easing: "ease-in",
                    iterations: 1,
                    fill: "forwards"
                }
            )
            setTimeout(() => {
                this.windowElement.style.display = "none";
            }, 1000)


        } else {
            throw new Error(`Unknown window visibility state: ${state}`);
        }
    }

    private hideDigits(counterElement: HTMLDivElement) {
        for (const i of DIGITS) {
            const numberElement: HTMLDivElement | null = counterElement.querySelector(`[data-number="${i}"]`);
            if (numberElement) {
                numberElement.style.display = "none";
            } else {
                console.error("Number ", i, "not found");
            }
        }
    }

    private countUp(counterElement: HTMLDivElement, digitId: number, DIGIT_ANIMATION_TIME: number, state?: number): Promise<void> {
        return new Promise((resolve) => {
            this.currentDigits[digitId] += 1;
            if (this.currentDigits[digitId] > DIGITS.length - 1) {
                this.currentDigits[digitId] = 0;
            }

            let lastDigit = this.currentDigits[digitId] - 1;
            if (this.currentDigits[digitId] === 0) {
                lastDigit = DIGITS.length - 1;
            }

            this.hideDigits(counterElement);

            const lastElement = counterElement.querySelector(`[data-number="${DIGITS[lastDigit]}"]`) as HTMLDivElement;
            const currentElement = counterElement.querySelector(`[data-number="${DIGITS[this.currentDigits[digitId]]}"]`) as HTMLDivElement;

            if (!currentElement || !lastElement) {
                console.error("Elements not found: ", DIGITS[lastDigit], DIGITS[this.currentDigits[digitId]]);
                console.error(lastDigit, this.currentDigits[digitId])
                resolve();
                return;
            }

            currentElement.style.zIndex = "1";
            lastElement.style.zIndex = "0";
            currentElement.style.display = "flex";
            lastElement.style.display = "flex";

            let easingStyle = 'linear';

            if (state == 0) {
                console.log("Set ease in");
                easingStyle = 'ease-in';
            } else if (state == 1) {
                console.log("Set ease out");
                easingStyle = 'ease-out';
            }

            console.log("Easing style: ", easingStyle);
            const currentAnimation = currentElement.animate([
                { transform: 'translateY(100%)' },
                { transform: 'translateY(-50%)' }
            ], {
                duration: DIGIT_ANIMATION_TIME,
                fill: 'forwards',
                easing: easingStyle
            });

            const lastAnimation = lastElement.animate([
                { transform: 'translateY(-50%)' },
                { transform: 'translateY(-150%)' }
            ], {
                duration: DIGIT_ANIMATION_TIME,
                fill: 'forwards',
                easing: easingStyle
            });

            this.audio.playSound(.1);

            Promise.all([currentAnimation.finished, lastAnimation.finished]).then(() => {
                lastElement.style.display = "none";
                resolve();
            });
        });
    }

    private sharpEase(t: number) {
        return Math.sin(t * Math.PI) ** 0.2
    }


    private waitTimeCalc(i: number, x: number): number {
        return Math.max((1 - this.sharpEase(x / i)), 0.06);
    }

    private async countBy(i: number, digitId: number, counterElement: HTMLDivElement) {
        let digitAnimTime = 2000;
        for (let x = 0; x < i; x++) {
            let ease;
            if (x == 0) {
                console.log("Ease in");
                ease = 0;
            }
            if (x == i - 1) {
                console.log("Ease out");
                ease = 1;
            }
            const animationTime = this.waitTimeCalc(i, x) * digitAnimTime;
            console.log("Animation time: ", animationTime);
            await this.countUp(counterElement, digitId, animationTime, ease);
        }
        this.placeAudio.playSound(0.5);
    }

    private getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    private confettiFireworks() {
        var duration = 15 * 1000;
        var animationEnd = Date.now() + duration;
        var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
        }

        var interval = setInterval(function () {
            var timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            var particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    private confettiSides() {
        var end = Date.now() + (15 * 1000);

        // go Buckeyes!
        var colors = ['#bb0000', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }

    private shuffleArray(arr: number[]): number[] {
        let shuffledArray = arr.slice(); // Create a copy of the array to avoid mutating the original
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
        }
        return shuffledArray;
    }

    private generateRandomOrder(x: number): number[] {
        const numbers = Array.from({ length: x + 1 }, (_, index) => index); // Create array [0, 1, ..., x]
        return this.shuffleArray(numbers);
    }


    private randomizeFunction(): { values: number[], order: number[] } {
        const shouldTryTrickChance = 50;
        const trickChance = 70;
        const numDigits = 3;

        const spinOrder = this.generateRandomOrder(numDigits - 1);
        console.log(spinOrder);

        if (this.getRandomInt(1, 100) <= shouldTryTrickChance) {
            if (this.getRandomInt(1, 100) <= trickChance) {

                console.log("Trick");

                let returnValue: number[] = [];
                const target = this.getRandomInt(1, DIGITS.length);

                for (const i of spinOrder) {
                    const currentDigit = this.currentDigits[i] + 1;
                    const amountToAdd = DIGITS.length - (currentDigit - target);
                    if (Number.isNaN(amountToAdd)) {
                        console.error(this.currentDigits);
                        throw new Error(`Amount to add is NaN: 
                        i: ${i},
                        currentDigit: ${currentDigit},
                        target: ${target}
                            `)
                    }
                    console.log("Amount to add: ", amountToAdd);
                    console.log("For: ", i);

                    if (i == numDigits - 1) {
                        const b = this.getRandomInt(1, 3);
                        if (b == 1) {
                            returnValue.push(amountToAdd + 1);
                        } else if (b == 2) {
                            returnValue.push(amountToAdd + -1);
                        } else {
                            console.error("Randomizer chose: ", b);
                            returnValue.push(amountToAdd + -1);
                        }

                    } else {
                        returnValue.push(amountToAdd);
                    }


                }

                return {
                    values: returnValue,
                    order: spinOrder
                };

                //return returnValue;
            } else {
                console.log("All three should be the same");

                let returnValue: number[] = [];
                const target = this.getRandomInt(1, DIGITS.length);

                for (const i of spinOrder) {
                    const currentDigit = this.currentDigits[i] + 1;
                    const amountToAdd = DIGITS.length - (currentDigit - target)
                    console.log("Amount to add: ", amountToAdd);

                    returnValue.push(amountToAdd);

                }

                return {
                    values: returnValue,
                    order: spinOrder
                };
            }
        } else {

            let returnValue: number[] = [];

            for (let i = 0; i < numDigits; i++) {

                returnValue.push(this.getRandomInt(1, DIGITS.length));
            }

            return {
                values: returnValue,
                order: spinOrder
            };
        }
    }

    private async shuffle() {
        if (this.rolling == true) return;

        const img: HTMLImageElement = this.windowElement.querySelector(".window-background") as HTMLImageElement;
        img.src = chrome.runtime.getURL("assets/gamble_bg_normal.png");

        const numDigits = 3;
        const delay = 1000;
        const a = 70;

        const tasks: Promise<void>[] = [];
        const randomized: { values: number[], order: number[] } = this.randomizeFunction();
        this.rolling = true;

        for (let i = 0; i < numDigits; i++) {
            let digitDelay;
            let orderDigit = randomized.order[i];
            if (orderDigit == numDigits - 1) {
                digitDelay = orderDigit * 4 * DIGITS.length
            } else {
                digitDelay = orderDigit * 2 * DIGITS.length
            }
            const shuffleAmount = randomized.values[i] + digitDelay + a;
            const element: HTMLDivElement | null = document.querySelector(`[data-counter-id="${i}"]`);

            console.log(element);
            if (element == null) {
                console.error(`Element with data-counter-id="${i}" not found.`);
                continue;
            }

            const task = this.countBy(shuffleAmount, i, element); // don't await, just collect the promise
            tasks.push(task);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        await Promise.all(tasks); // Wait for all countBy() calls to finish
        console.log("All digits finished counting.");

        let firstN = this.currentDigits[0];
        for (let i = 0; i < numDigits; i++) {
            if (firstN != this.currentDigits[i]) {
                this.loseAudio.playSound(.2);
                console.log("LOSE");
                //confetti();
                //confettiSides();
                //confettiFireworks();
                break;
            } else if (i == numDigits - 1) {
                console.log("WIN!");
                const img: HTMLImageElement = this.windowElement.querySelector(".window-background") as HTMLImageElement;
                img.src = chrome.runtime.getURL("assets/gamble_bg_win.png");
                this.winAudio.playSound(1);
                confetti();
                this.confettiSides();
                this.confettiFireworks();
            }
        }

        this.rolling = false;
    }

    private init() {

        this.audio.loadSound("sounds/gamble/beep.wav");
        this.placeAudio.loadSound("sounds/gamble/boom.mp3");
        this.loseAudio.loadSound("sounds/gamble/lost.mp3");
        this.winAudio.loadSound("sounds/gamble/win.mp3");
        const numDigits = 3;

        for (let i = 0; i < numDigits; i++) {
            this.currentDigits[i] = 0;
        }
    }

    private async onLoad() {
        this.init();
        const btn: HTMLButtonElement | null = this.windowElement.querySelector("#roll");
        if (btn) {
            btn.addEventListener("click", () => {
                this.shuffle();
            });
        } else {
            throw new Error("Roll button is null");
        }
    }
}
import { CELL_HEIGHT, CELL_WIDTH, SUBDIVISIONS } from "./config";
import { Snake } from "./snake";
import { Vector2 } from "./vec2";

import foodImage from './assets/food.png'






export class Game {

    private doubleSnakes: boolean = false;
    private foods: Vector2[] = [];
    private snakes: Snake[] = [];
    private nextGameDoubleSnakes: boolean = false;
    private numberOfFoods: number = 1;
    private gameStarted: boolean = false;
    private isVisible: boolean = false;

    private canvas: HTMLCanvasElement = document.querySelector("#game") as HTMLCanvasElement;



    private areaX = this.canvas.width / CELL_WIDTH;
    private areaY = this.canvas.height / CELL_HEIGHT;



    private ctx = this.canvas.getContext("2d")!;

    private FoodImage = new Image();

    constructor() {
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;
        this.FoodImage.src = foodImage;
        this.foodCallback = this.foodCallback.bind(this);
        this.lostCallback = this.lostCallback.bind(this);

        // FOCUS!@!

        const enforceFocus = () => {
            if (document.activeElement != this.canvas) {
                this.canvas.focus();
            }
        }

        this.canvas.addEventListener("blur", () => {
            if (this.gameStarted == false) return;
            setTimeout(enforceFocus, 0);
        })

        this.initialize();
        this.gameStartedEvent();
        this.resetGame();
        this.showWindow();

        window.onresize = () => {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.areaX = this.canvas.width / CELL_WIDTH;
            this.areaY = this.canvas.height / CELL_HEIGHT;
        }





    }
    nextGameDoubleSnakesSet(v: boolean) {
        this.nextGameDoubleSnakes = v;
    }

    private createFood() {
        while (this.foods.length < this.numberOfFoods) {
            let valid = false;
            let attempts = 0;
            while (!valid) {
                console.log("Attempt to place food...");
                const position = new Vector2(
                    Math.floor(Math.random() * (this.areaX - 2)) + 1,
                    Math.floor(Math.random() * (this.areaY - 2)) + 1
                );

                console.log("Placed at: ", position);

                const exists = this.foods.some(f => f.equals(position));
                if (exists) {
                    continue;
                }

                this.foods.push(position);
                valid = true;
                attempts += 1;
                if (attempts > 100) {
                    console.warn("Too many attempts exhausted; giving up");
                    for (const snake of this.snakes) {
                        snake.updateFoodPositions(this.foods);
                    }
                    return;
                }
            }
        }


        for (const snake of this.snakes) {
            snake.updateFoodPositions(this.foods);
        }

    }
    private gameStartedEvent() {
        document.addEventListener("keydown", () => {
            const win = document.querySelector("#info") as HTMLDivElement;
            if (!win) return;
            if (win.style.display != "none") return;
            this.gameStarted = true;
            for (const snake of this.snakes) {
                snake.setGameStarted(true);
            }
        })
    }

    private updateScore() {
        let totalLength = 0;
        for (const snake of this.snakes) {
            totalLength += snake.getPoints().length / SUBDIVISIONS;
        }
        const a = document.querySelector("#score") as HTMLSpanElement;
        if (!a) return;
        a.textContent = `Score: ${totalLength}`;
    }

    private drawGrid() {


        for (let x = 0; x < this.areaX; x++) {
            for (let y = 0; y < this.areaY; y++) {
                if (y % 2 == 0) {
                    if (x % 2 == 0) {
                        this.ctx.fillStyle = "#E7E7E8";
                        this.ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                    } else {
                        this.ctx.fillStyle = "#D4D4D4";
                        this.ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                    }
                } else {
                    if (x % 2 == 1) {
                        this.ctx.fillStyle = "#E7E7E8";
                        this.ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                    } else {
                        this.ctx.fillStyle = "#D4D4D4";
                        this.ctx.fillRect(x * CELL_WIDTH, y * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT);
                    }
                }


            }
        }
    }


    private createSnakes() {
        this.doubleSnakes = this.nextGameDoubleSnakes;
        if (this.doubleSnakes) {
            this.snakes = [

                new Snake(new Vector2(
                    Math.round(this.areaX / 2),
                    Math.round(this.areaY / 2)
                ), new Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback),

                new Snake(new Vector2(
                    Math.round(this.areaX / 3),
                    Math.round(this.areaY / 3)
                ), new Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback, 1)

            ]

            this.snakes[1].setUseWSAD(true);

            if (this.doubleSnakes) {
                this.snakes[0].updateOtherPoints(this.snakes[1].getPoints());
                this.snakes[1].updateOtherPoints(this.snakes[0].getPoints());
            }
        } else {
            this.snakes = [
                new Snake(new Vector2(
                    Math.round(this.areaX / 2),
                    Math.round(this.areaY / 2)
                ), new Vector2(0, -1), 4, this.areaX, this.areaY, this.foodCallback, this.lostCallback)
            ];
        }

        for (const snake of this.snakes) {
            snake.updateFoodPositions(this.foods);
        }

    }

    private foodCallback(position: Vector2) {
        console.warn("GOT THE FOOD!!!");
        const idx = this.foods.findIndex(f => f.equals(position));
        if (idx !== -1) this.foods.splice(idx, 1);
        if (this.doubleSnakes) {
            this.snakes[0].updateOtherPoints(this.snakes[1].getPoints());
            this.snakes[1].updateOtherPoints(this.snakes[0].getPoints());
        }


        this.createFood();
        this.updateScore();
    }

    private lostCallback(length: number) {
        console.warn("Lost with length: ", length);
        let totalLength = 0;
        for (const snake of this.snakes) {
            totalLength += snake.getPoints().length / SUBDIVISIONS;
        }

        alert("(Temporary UI) Total score of: " + totalLength.toString());

        this.lostFunction();
    }

    private lostFunction() {
        this.snakes.length = 0;
        this.resetGame();
        this.showWindow();


    }

    private drawFood() {
        this.foods.forEach((position, index) => {


            const foodWidth = CELL_WIDTH * 0.5;
            const foodHeight = CELL_HEIGHT * 0.5;
            const x = position.x * CELL_WIDTH;
            const y = position.y * CELL_HEIGHT;

            //this.ctx.fillStyle = "green";
            //this.ctx.fillRect(x + foodWidth / 2, y + foodHeight / 2, foodWidth, foodHeight);
            this.ctx.drawImage(this.FoodImage, x, y);

            //console.log("Fill at: ", x, y);
        })

        //console.log(foods[0]);
    }


    private render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.drawFood();
        for (const snake of this.snakes) {
            snake.render(this.ctx);
        }

    }





    private update() {
        this.render();
        for (const snake of this.snakes) {
            snake.update();
        }
    }

    private renderLoop = () => {
        if (this.isVisible) {
            this.update();
        }


        requestAnimationFrame(this.renderLoop);
    }

    private updateCanvas() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.areaX = this.canvas.width / CELL_WIDTH;
        this.areaY = this.canvas.height / CELL_HEIGHT;
    }
    private resetGame() {
        this.gameStarted = false;
        this.createSnakes();
        this.foods.length = 0;
        this.createFood();
        this.updateScore();
    }
    private showWindow() {
        const win = document.querySelector("#info") as HTMLDivElement;
        if (!win) return;
        win.style.display = "block";
    }

    private windowHandler() {
        const win = document.querySelector("#info") as HTMLDivElement;
        if (!win) return;

        const small = document.querySelector("#small") as HTMLButtonElement;
        const medium = document.querySelector("#medium") as HTMLButtonElement;
        const large = document.querySelector("#large") as HTMLButtonElement;
        const largest = document.querySelector("#largest") as HTMLButtonElement;
        small.addEventListener("click", () => {
            this.canvas.style.width = "240px";
            this.canvas.style.height = "240px";
            this.updateCanvas();
            this.resetGame();
        })
        medium.addEventListener("click", () => {
            this.canvas.style.width = "480px";
            this.canvas.style.height = "480px";
            this.updateCanvas();
            this.resetGame();
        })
        large.addEventListener("click", () => {
            this.canvas.style.width = "800px";
            this.canvas.style.height = "800px";
            this.updateCanvas();
            this.resetGame();
        })
        largest.addEventListener("click", () => {
            this.canvas.style.width = "1600px";
            this.canvas.style.height = "800px";
            this.updateCanvas();
            this.resetGame();
        })
        const hard = document.querySelector("#double-snakes") as HTMLInputElement;
        hard.addEventListener("input", () => {
            this.nextGameDoubleSnakesSet(hard.checked);
            this.resetGame();
        });
        const apples = document.querySelector("#apples") as HTMLInputElement;
        apples.addEventListener("input", () => {
            this.numberOfFoods = parseInt(apples.value);
            this.resetGame();

        })
        const begin = document.querySelector("#begin") as HTMLButtonElement;
        begin.addEventListener("click", () => {
            win.style.display = "none";
            this.gameStartedEvent();
        })

    }
    setVisibility(value: boolean) {
        this.isVisible = value;
    }

    private initialize() {
        this.windowHandler();
        this.createSnakes();
        this.createFood();
        this.updateScore();



        this.renderLoop();
    }


}





















import { CELL_HEIGHT, CELL_WIDTH, FramesPerCell, MOVEMENT_SPEED, SUBDIVISIONS, TURN_REJECT_THRESHOLD } from "./config";
import { Vector2 } from "./vec2";

import headRightURL from './assets/head_right.png';
import headLeftURL from "./assets/head_left.png";
import headUpURL from "./assets/head_up.png";
import headDownURL from "./assets/head_down.png";

const headRightImage = new Image(); headRightImage.src = headRightURL;
const headLeftImage = new Image(); headLeftImage.src = headLeftURL;
const headUpImage = new Image(); headUpImage.src = headUpURL;
const headDownImage = new Image(); headDownImage.src = headDownURL;

export class Snake {

    position: Vector2;
    direction: Vector2;
    private numX: number;
    private numY: number;
    private frameCounter: number = 0;
    private pendingTurn: "none" | "up" | "down" | "left" | "right" = "none";

    private snakePoints: Vector2[] = [];
    private previousPoints: { p: Vector2, c: number }[] = [];
    private foods: Vector2[] = [];
    private foodCallback: ((position: Vector2) => void);
    private lostCallback: (length: number) => void;
    private otherPoints: Vector2[] = [];
    private useWSADControls: boolean = false;
    private gameStarted: boolean = false;

    constructor(initialPosition: Vector2, initialDirection: Vector2, initialLength: number, numX: number, numY: number, eatenFoodCallback: ((position: Vector2) => void), lostCallback: (length: number) => void) {
        this.position = initialPosition;
        this.direction = initialDirection;
        this.foodCallback = eatenFoodCallback;
        this.lostCallback = lostCallback;

        this.numX = numX;
        this.numY = numY;

        this.keyEvents();
        this.generateSnake(initialLength);
    }
    setUseWSAD(value: boolean) {
        this.useWSADControls = value;
    }
    setGameStarted(value: boolean) {
        this.gameStarted = value;
    }

    private generateSnake(length: number) {

        const beginParts = 20
        this.frameCounter = FramesPerCell * beginParts;
        for (let i = 0; i < beginParts; i++) {
            this.snakePoints.push(this.position.sub(new Vector2(0, i)));
        }

        for (let i = 0; i < beginParts * FramesPerCell; i++) {
            this.previousPoints.push({ p: this.position.sub(new Vector2(i / FramesPerCell)), c: i });
        }

        //console.log(this.previousPoints);
        //console.log(this.snakePoints);

    }
    private snakeUpdate() {
        this.frameCounter += 1;
        if (this.gameStarted) {
            this.position = this.position.add(this.direction.multiplyScalar(MOVEMENT_SPEED));
        }
        
        //console.log(this.position);

        // Previous points




        const interval = FramesPerCell / SUBDIVISIONS;
        const bufLen = this.previousPoints.length;
        const newest = bufLen - 1;

        this.snakePoints.forEach((part, i) => {
            // how many frames back this segment should trail
            const idx = Math.round(newest - i * interval);
            // clamp to [0, newest]
            const clamped = Math.max(0, Math.min(idx, newest));
            const point = this.previousPoints[clamped];

            part.x = point.p.x;
            part.y = point.p.y;
        });

        // Distance to previous

        // Euler's distance squared

        this.previousPoints.push({ p: this.position, c: this.frameCounter });
        if (this.previousPoints.length > this.snakePoints.length * (FramesPerCell / SUBDIVISIONS) + (FramesPerCell / SUBDIVISIONS) * 3) {
            this.previousPoints.splice(0, 1);
        }

        //console.log(this.previousPoints);
        //console.log(this.position);



    }

    private getFood() {


        let index = 0;
        for (const food of this.foods) {
            const difference = Math.max(Math.abs(food.x - this.position.x), Math.abs(food.y - this.position.y));
            if (difference < TURN_REJECT_THRESHOLD) {
                for (let i = 0; i < SUBDIVISIONS; i++) {
                    this.snakePoints.push(new Vector2(-10, -10)); // Add a new segment
                }
                this.foods.splice(index, 1);
                this.foodCallback(food);
            }
            index++;
        }


    }

    private drawSnake(ctx: CanvasRenderingContext2D) {

        const snakeWidth = CELL_WIDTH * 0.5;
        const snakeHeight = CELL_HEIGHT * 0.5;

        //ctx.fillStyle = "blue";
        //ctx.fillRect(this.position.x * CELL_WIDTH + snakeWidth / 2, this.position.y * CELL_HEIGHT + snakeHeight / 2, snakeWidth, snakeHeight);
        ctx.beginPath();
        let i = 0;
        for (const part of this.snakePoints) {

            const x = part.x * CELL_WIDTH + CELL_WIDTH / 2;
            const r = (snakeWidth * 0.75) * (1 - (i / this.snakePoints.length) * 0.15);
            const y = part.y * CELL_HEIGHT + CELL_HEIGHT / 2;
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, 0, Math.PI * 2);
            i++;

        }
        ctx.fillStyle = "#5b7bf9";
        ctx.fill();

        // Draw the head

        const x = this.position.x * CELL_WIDTH;
        const y = this.position.y * CELL_HEIGHT;

        if (this.direction.equals(new Vector2(-1, 0))) {
            // Going left

            ctx.drawImage(headLeftImage, x, y);
        }
        if (this.direction.equals(new Vector2(1, 0))) {
            // Going right

            ctx.drawImage(headRightImage, x, y);
        }
        if (this.direction.equals(new Vector2(0, -1))) {
            // Going up

            ctx.drawImage(headUpImage, x, y);
        }
        if (this.direction.equals(new Vector2(0, 1))) {
            // Going down

            ctx.drawImage(headDownImage, x, y);
        }

    }

    private isWithinBorders() {
        if (this.position.x < 0 || this.position.y < 0) {
            return false;
        }
        if (this.position.x > this.numX - 1 || this.position.y > this.numY - 1) {
            return false;
        }
        return true;
    }

    private ensureTurningOnCell() {
        const closestCellX = Math.round(this.position.x + this.direction.x * -0);
        const closestCellY = Math.round(this.position.y + this.direction.y * -0);

        const difference = Math.max(Math.abs(closestCellX - this.position.x), Math.abs(closestCellY - this.position.y));
        if (difference > TURN_REJECT_THRESHOLD) {
            return false;
        }

        // Teleport to cell

        this.position = new Vector2(closestCellX, closestCellY);

        return true;

    }
    private keyEvents() {
        document.addEventListener("keydown", (e) => {
            if (this.useWSADControls) {
                if (e.key === "w" || e.key === "W") {
                    this.pendingTurn = "up";
                } else if (e.key === "s" || e.key === "S") {
                    this.pendingTurn = "down";
                } else if (e.key === "a" || e.key === "A") {
                    this.pendingTurn = "left";
                } else if (e.key === "d" || e.key === "D") {
                    this.pendingTurn = "right";
                }
            } else {
                if (e.key === "ArrowUp") {
                    this.pendingTurn = "up";
                } else if (e.key === "ArrowDown") {
                    this.pendingTurn = "down";
                } else if (e.key === "ArrowLeft") {
                    this.pendingTurn = "left";
                } else if (e.key === "ArrowRight") {
                    this.pendingTurn = "right";
                }
            }
        });
    }

    private updatePendingTurn() {
        if (this.pendingTurn === "none") return;


        if (this.ensureTurningOnCell() == false) {
            // Failed to turn, not close enough to cell center or next cell center
            return;
        }


        switch (this.pendingTurn) {
            case 'up':
                if (this.direction.y != 0) break;
                this.direction = new Vector2(0, -1);
                break;
            case 'down':
                if (this.direction.y != 0) break;

                this.direction = new Vector2(0, 1);
                break;
            case 'left':
                if (this.direction.x != 0) break;

                this.direction = new Vector2(-1, 0);
                break;
            case 'right':
                if (this.direction.x != 0) break;

                this.direction = new Vector2(1, 0);
                break;
            default:
                console.warn("Unknown value: ", this.pendingTurn);
        }
        this.pendingTurn = "none";
    }

    reset() {
        this.pendingTurn = "none";
        this.snakePoints.length = 0;
        this.previousPoints.length = 0;
        this.position = new Vector2(
            Math.round(this.numX / 2),
            Math.round(this.numY / 2)
        )
        //this.generateSnake(4);
    }
    rebuild() {
        this.generateSnake(4);
    }

    private hasCollidedWithSelf() {
        for (const position of this.snakePoints) {
            const actualPosition = this.position.add(this.direction.multiplyScalar(0.5));
            const dSquared = (actualPosition.x - position.x) ** 2 + (actualPosition.y - position.y) ** 2;
            if (dSquared < (1 / SUBDIVISIONS) ** 2) {
                console.log("Collided with: ", position, " distance squared of: ", dSquared);
                return true;
            }
        }
        return false;
    }
    private hasCollidedWithOthers() {
        for (const position of this.otherPoints) {
            const actualPosition = this.position.add(this.direction.multiplyScalar(0.5));
            const dSquared = (actualPosition.x - position.x) ** 2 + (actualPosition.y - position.y) ** 2;
            if (dSquared < (1 / SUBDIVISIONS) ** 2) {
                console.log("Collided with: ", position, " distance squared of: ", dSquared);
                return true;
            }
        }
        return false;
    }

    update() {
        this.snakeUpdate();
        this.updatePendingTurn();
        this.getFood();

        if (this.isWithinBorders() == false) {
            // Reset everything

            this.lostCallback(this.snakePoints.length / SUBDIVISIONS);
            //this.reset();

        }
        if (this.hasCollidedWithSelf() == true) {
            this.lostCallback(this.snakePoints.length / SUBDIVISIONS);
            //this.reset();
        }
        if (this.hasCollidedWithOthers() == true) {
            this.lostCallback(this.snakePoints.length / SUBDIVISIONS);
        }
    }

    getPoints() {
        return this.snakePoints;
    }

    updateFoodPositions(foods: Vector2[]) {
        this.foods = foods;
    }
    updateOtherPoints(others: Vector2[]) {
        this.otherPoints = others;
    }


    render(ctx: CanvasRenderingContext2D) {
        this.drawSnake(ctx);
    }
}
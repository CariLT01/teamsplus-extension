export class Vector2 {

    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    multiply(other: Vector2) {
        return new Vector2(this.x * other.x, this.y * other.y);
    }

    add(other: Vector2) {
        return new Vector2(this.x + other.x, this.y + other.y);
    }

    multiplyScalar(scalar: number) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    sub(other: Vector2) {
        return new Vector2(this.x - other.x, this.y - other.y);
    }

    equals(other: Vector2) {
        return (this.x == other.x && this.y == other.y);
    }
}
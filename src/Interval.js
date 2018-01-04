export default class Interval{
    constructor(min, max) {
        this.min = min
        this.max = max
    }
    toString() {
        return `${this.min} : ${this.max}`
    }
}
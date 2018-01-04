class Engine{
    constructor() {
        this.forces = null
        this.masslessForce = null
        this.groups = null
        this.numGroups = 0
        this.timeStep = 0
        this.renderer = null
        this.damping = 1
        this.constraintCycles = 0
        this.constraintCollisionCycles = 1
    }
    init(dt) {
        if (isNaN(dt)) {
            dt = 0.25;
        }
        this.timeStep = dt * dt;
        this.groups = [];
        this.forces = [];
    }
    addForce(v) {
        this.forces.push(v);
    }
    removeForce(v) {
        const index = this.forces.indexOf(v)
        if (index != -1) {
            this.forces.splice(index, 1)
        }
    }
    removeAllForce() {
        this.forces = [];
    }
    addGroup(g) {
        this.groups.push(g);
        g.isParented = true;
        this.numGroups++;
        g.init();
    }
    removeGroup(g) {
        const index = this.groups.indexOf(g);
        if (index == -1) {
            return;
        }
        this.groups.splice(index, 1);
        g.isParented = false;
        this.numGroups--;
        g.cleanup();
    }
    step() {
        this.integrate();
        for (let j = 0; j < this.constraintCycles; j++) {
            this.satisfyConstraints();
        }
        for (let i = 0; i < this.constraintCollisionCycles; i++) {
            this.satisfyConstraints();
            this.checkCollisions();
        }
    }
    paint() {
        for (let j = 0; j < this.numGroups; j++) {
            const g = this.groups[j];
            g.paint();
        }
    }
    integrate() {
        for (let j = 0; j < this.numGroups; j++) {
            const g = this.groups[j];
            g.integrate(this.timeStep);
        }
    }
    satisfyConstraints() {
        for (let j = 0; j < this.numGroups; j++) {
            const g = this.groups[j];
            g.satisfyConstraints();
        }
    }
    checkCollisions() {
        for (let j = 0; j < this.numGroups; j++) {
            const g = this.groups[j];
            g.checkCollisions();
        }
    }
}

module.exports = new Engine()
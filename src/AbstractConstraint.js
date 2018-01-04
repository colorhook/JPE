import AbstractItem from './AbstractItem'

export default class AbstractConstraint extends AbstractItem{
    constructor(stiffness) {
        super()
        this.stiffness = stiffness;
        this.setStyle();
    }
    get stiffness() {
        return this._stiffness
    }
    set stiffness(v) {
        this._stiffness = v
    }
    resolve() {

    }
}
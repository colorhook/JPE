import AbstractItem from './AbstractItem'
import Signal from './Signal'

export default class AbstractConstraint extends AbstractItem{
    constructor() {
        this.stiffness = stiffness;
        this.setStyle();
        this._pool = {};
        this.beforeRenderSignal = new Signal();
        this.afterRenderSignal = new Signal();
    }
    resolve() {

    }
}
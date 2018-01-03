export default class Renderer {
    constructor() {
        this._items = {};
        this._delegates = {};
    }
    registerDelegate(type, itemCls, delegate) {
        this._items[type] = itemCls;
        this._delegates[type] = delegate;
    }
    getParticleClass: function(type) {
        return this._items[type];
    }
    getDelegateClass(type) {
        return this._delegates[type];
    }
    findDelegateByParticle(item) {
        var ic = item.constructor,
            ps = this._items,
            ds = this._delegates;
        while (ic.superclass) {
            for (var prop in ps) {
                if (ps[prop] === ic) {
                    return ds[prop]
                }
            }
            ic = ic.superclass;
        }
        return null;
    }
    getRenderDelegate(item) {
        var rd = item.get('renderDelegate');
        if (rd == undefined) {
            rd = this.findDelegateByParticle(item)
            item.set('renderDelegate', rd);
        }
        return rd;
    }
    initSelf(item) {
        var rd = this.getRenderDelegate(item);
        rd && rd.initSelf(item);
    }
    cleanup(item) {
        var rd = this.getRenderDelegate(item);
        rd && rd.cleanup(item);
    }
    render(item) {
        var rd = this.getRenderDelegate(item);
        rd && rd.render(item);
    }
    setVisible(item) {
        var rd = this.getRenderDelegate(item);
        rd && rd.setVisible(item);
    }
}
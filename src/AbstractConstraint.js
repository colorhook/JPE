define("JPE/AbstractConstraint", function(require, exports, module) {

    var JPE = require("JPE/JPE");
    var AbstractItem = require("JPE/AbstractItem");
    var Signal = require("JPE/Signal");

    var AbstractConstraint = function(stiffness) {
        this.stiffness = stiffness;
        this.setStyle();
        this._pool = {};
        this.beforeRenderSignal = new Signal();
        this.afterRenderSignal = new Signal();
    };

    JPE.extend(AbstractConstraint, AbstractItem, {
        resolve: function() {}
    });

    module.exports = AbstractConstraint;
});
define("JPE/Interval", function(require, exports, module) {
    module.exports = function(min, max) {
        this.min = min;
        this.max = max;
    };
});
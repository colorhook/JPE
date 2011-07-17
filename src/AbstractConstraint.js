JPE.declare('AbstractConstraint', {
	superclass: JPE.AbstractItem,
	
	constructor: function(stiffness){
		this.stiffness = stiffness;
		this.setStyle();
		this._pool = {};
		this.beforeDrawSignal = new JPE.Signal();
		this.afterDrawSignal = new JPE.Signal();
	},
	resolve: function(){
	}
});

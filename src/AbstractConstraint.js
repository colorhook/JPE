JPE.declare('AbstractConstraint', {
	superclass: JPE.AbstractItem,
	
	constructor: function(stiffness){
		this.stiffness = stiffness;
		this.setStyle();
		this._pool = {};
		this.beforeRenderSignal = new JPE.Signal();
		this.afterRenderSignal = new JPE.Signal();
	},
	resolve: function(){
	}
});

JPE.declare('AbstractConstraint', {
	superclass: JPE.AbstractItem,
	
	constructor: function(stiffness){
		this.stiffness = stiffness;
		this.setStyle();
	},
	resolve: function(){
	}
});

define("JPE/CollisionResolver", function(require, exports, module) {

    exports.resolve = function(pa, pb, normal, depth) {

        // a collision has occured. set the current positions to sample locations
        //pa.curr.copy(pa.samp);
        //pb.curr.copy(pb.samp);
        var mtd = normal.mult(depth);
        var te = pa.getElasticity() + pb.getElasticity();

        var sumInvMass = pa.getInvMass() + pb.getInvMass();
        // the total friction in a collision is combined but clamped to [0,1]
        var tf = this.clamp(1 - (pa.getFriction() + pb.getFriction()), 0, 1);

        // get the collision components, vn and vt
        var ca = pa.getComponents(normal);
        var cb = pb.getComponents(normal);

        // calculate the coefficient of restitution based on the mass, as the normal component
        var vnA = (cb.vn.mult((te + 1) * pa.getInvMass()).plus(
        ca.vn.mult(pb.getInvMass() - te * pa.getInvMass()))).divEquals(sumInvMass);

        var vnB = (ca.vn.mult((te + 1) * pb.getInvMass()).plus(
        cb.vn.mult(pa.getInvMass() - te * pb.getInvMass()))).divEquals(sumInvMass);

        // apply friction to the tangental component
        ca.vt.multEquals(tf);
        cb.vt.multEquals(tf);

        // scale the mtd by the ratio of the masses. heavier particles move less 
        var mtdA = mtd.mult(pa.getInvMass() / sumInvMass);
        var mtdB = mtd.mult(-pb.getInvMass() / sumInvMass);

        // add the tangental component to the normal component for the new velocity 
        vnA.plusEquals(ca.vt);
        vnB.plusEquals(cb.vt);


        pa.resolveCollision(mtdA, vnA, normal, depth, -1, pb);
        pb.resolveCollision(mtdB, vnB, normal, depth, 1, pa);
    };

    exports.clamp = function(input, min, max) {
        if (input > max) return max;
        if (input < min) return min;
        return input;
    };

});
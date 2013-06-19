define("JPE/RigidCollisionResolver", function(require, exports, module) {

    module.exports = {

        resolve: function(pa, pb, hitpoint, normal, depth) {
                
            var mtd = normal.mult(depth);
            var te = pa._elasticity + pb._elasticity;
            var sumInvMass = pa.getInvMass() + pb.getInvMass();

            //rewrite collision resolve
            var vap = pa.getVelocityOn(hitpoint);
            var vbp = pb.getVelocityOn(hitpoint);
            var vabp = vap.minus(vbp);
            var vn = normal.mult(vabp.dot(normal));
            var l = vabp.minus(vn).normalize();
            var n = normal.plus(l.mult(-0.1)).normalize();
            var ra = hitpoint.minus(pa.samp);
            var rb = hitpoint.minus(pb.samp);

            var raxn = ra.cross(n);
            var rbxn = rb.cross(n);
            var j = -vabp.dot(n) * (1 + te / 2) / (sumInvMass + raxn * raxn / pa.mi + rbxn * rbxn / pb.mi);

            var vna = pa.getVelocity().plus(n.mult(j * pa.getInvMass()));
            var vnb = pb.getVelocity().plus(n.mult(-j * pb.getInvMass()));
   
            var aaa = j * raxn / pa.mi;
            var aab = -j * rbxn / pb.mi;
            if (Math.abs(aaa) > 0.1 || Math.abs(aab) > 0.1) {}

            pa.resolveRigidCollision(aaa, pb);
            pb.resolveRigidCollision(aab, pa);
            var mtdA = mtd.mult(pa.getInvMass() / sumInvMass);
            var mtdB = mtd.mult(-pb.getInvMass() / sumInvMass);
            pa.resolveCollision(mtdA, vna, normal, depth, -1, pb);
            pb.resolveCollision(mtdB, vnb, normal, depth, 1, pa);
        }
    }

});
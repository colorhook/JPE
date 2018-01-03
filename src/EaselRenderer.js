import Renderer from "./Renderer"
import RectangleParticle from "./RectangleParticle"
import RigidRectangle from "./RigidRectangle"
import CircleParticle from "./CircleParticle"
import RigidCircle from  "./RigidCircle"
import WheelParticle from "./WheelParticle"
import SpringConstraintParticle from "./SpringConstraintParticle"
import SpringConstraint from "./SpringConstraint"

class AbstractDelegate() {
    constructor(renderer) {
        this.renderer = renderer;
        this.stage = renderer.stage;
    }
}

class RectangleParticleDelegate extends AbstractDelegate {
    drawShape(item) {
        var shape = item.get('shape'),
            g = shape.graphics,
            w = item.getExtents()[0] * 2,
            h = item.getExtents()[1] * 2;
        shape.x = -w / 2;
        shape.y = -h / 2;
        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness)
            g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawRect(0, 0, w, h);
        g.endFill();
    }
    render(item) {
        var sprite = item.get('sprite'),
            x = item.curr.x,
            y = item.curr.y,
            w = item.getExtents()[0] * 2,
            h = item.getExtents()[1] * 2,
            r = item.getAngle();

        if (sprite) {
            this.drawShape(item);
            sprite.rotation = r;
            sprite.x = x;
            sprite.y = y;
        }
    }
}

class CircleParticleDelegate extends AbstractDelegate{
    drawShape(item) {
        var r = item.getRadius(),
            shape = item.get('shape'),
            g = shape.graphics;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness)
            g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawCircle(0, 0, r);
        g.endFill();
    }
    render(item) {
        var x = item.curr.x,
            y = item.curr.y,
            sprite = item.get('sprite');

        if (sprite) {
            this.drawShape(item);
            sprite.x = x;
            sprite.y = y;
        }
    }
}

class WheelParticleDelegate extends AbstractDelegate {
    drawShape(item) {
        
        var r = item.getRadius(),
            shape = item.get('shape'),
            g = shape.graphics;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness);
            g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawCircle(0, 0, r);

        g.setStrokeStyle(1);
        g.beginStroke(Graphics.getRGB(0xffffff - item.lineColor));
        g.moveTo(-r, 0);
        g.lineTo(r, 0);
        g.moveTo(0, -r);
        g.lineTo(0, r);
        g.endFill();
    }
    render(item) {
        var x = item.curr.x,
            y = item.curr.y,
            r = item.getAngle(),
            sprite = item.get('sprite');

        if (sprite) {
            this.drawShape(item);
            sprite.rotation = r;
            sprite.x = x;
            sprite.y = y;
        }

    }
}

class SpringConstraintParticleDelegate extends AbstractDelegate {
    initSelf(item) {
        var inner = new Container(),
            shape = new Shape(),
            parent = item.parent,
            parentSprite = parent.get('sprite');
        if (!parentSprite) {
            parentSprite = new Container();
            parent.set('sprite', parentSprite);
        }
        item.set('sprite', inner);
        item.set('shape', shape);
        if (!item.getVisible()) {
            sprite.visible = false;
        }
        inner.addChild(shape);
        parentSprite.addChild(inner);
        this.drawShape(item);
        this.stage.addChild(parentSprite);
    }
    cleanup(item) {
        var parent = item.parent;
        this.stage.removeChild(parent.get('sprite'));
    }
    drawShape(item) {
        var shape = item.get('shape'),
            g = shape.graphics,
            parent = item.parent,
            c = parent.getCenter(),
            w = parent.getCurrLength() * item.getRectScale(),
            h = item.getRectHeight();


        g.clear();
        if (parent.lineThickness) {
            g.setStrokeStyle(parent.lineThickness);
            g.beginStroke(Graphics.getRGB(parent.lineColor, parent.lineAlpha));
        }
        g.beginFill(Graphics.getRGB(parent.fillColor, parent.fillAlpha));
        g.drawRect(-w / 2, -h / 2, w, h);
        g.endFill();
    }
    render(item) {

        var parent = item.parent,
            c = parent.getCenter(),
            s = item.get('sprite'),
            shape = item.get('shape');

        s.x = c.x;
        s.y = c.y;
        if (item.scaleToLength) {
            s.width = parent.getCurrLength() * item.getRectScale();
        }
        s.rotation = parent.getAngle();


    }
}

class SpringConstraintDelegate extends AbstractDelegate {
    initSelf(item) {
    }
    cleanup(item) {
        var sprite = item.get('sprite');
        if (sprite) {
            this.stage.removeChild(sprite);
        }
    }
    initShape(item) {
        var sprite = new Container(),
            shape = new Shape();

        item.set('sprite', sprite);
        item.set('shape', shape);
        sprite.addChild(shape);
        this.stage.addChild(sprite);
    }
    drawShape(item) {
        var shape = item.get('shape'),
            g = shape.graphics,
            p1 = item.p1,
            p2 = item.p2;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness);
            g.beginStroke(Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.moveTo(p1.getPx(), p1.getPy());
        g.lineTo(p2.getPx(), p2.getPy());
        g.endFill();
    }
    render(item) {
        if (item.getCollidable()) {
            item.scp.paint();
        } else {
            if (!item.get('shape')) {
                this.initShape(item);
            }
            this.drawShape(item);
        }
    }
}

export default class EaselRenderer extends Renderer {
    constructor(stage) {
        super()
        this.stage = stage;
        this.registerDelegate('RectangleParticle', RectangleParticle, new RectangleParticleDelegate(this));
        this.registerDelegate('RigidRectangle', RigidRectangle, new RectangleParticleDelegate(this));
        this.registerDelegate('CircleParticle', CircleParticle, new CircleParticleDelegate(this));
        this.registerDelegate('RigidCircle', RigidCircle, new WheelParticleDelegate(this));
        this.registerDelegate('WheelParticle', WheelParticle, new WheelParticleDelegate(this));
        this.registerDelegate('SpringConstraintParticle', SpringConstraintParticle, new SpringConstraintParticleDelegate(this));
        this.registerDelegate('SpringConstraint', SpringConstraint, new SpringConstraintDelegate(this));
    }
    initSelf(item) {
        var sprite = new Container(),
            shape = new Shape();
        sprite.addChild(shape);
        if (!item.getVisible()) {
            sprite.visible = false;
        }
        this.stage.addChild(sprite);
        item.set('sprite', sprite);
        item.set('shape', shape);
        this.drawShape(item);
    }
    cleanup(item) {
        var s = item.get('sprite');
        if (s) {
            this.stage.removeChild(s);
        }
    }
    drawShape(item) {}
    setVisible(item) {
        var sprite = item.get('sprite');
        if (sprite) {
            sprite.visible = item.getVisible();
        }
    }
    render(item) {}
}

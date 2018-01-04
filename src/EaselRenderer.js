import Renderer from "./Renderer"
import RectangleParticle from "./RectangleParticle"
import CircleParticle from "./CircleParticle"
import WheelParticle from "./WheelParticle"
import SpringConstraintParticle from "./SpringConstraintParticle"
import SpringConstraint from "./SpringConstraint"

class AbstractDelegate {
    constructor(renderer) {
        this.renderer = renderer;
        this.stage = renderer.stage;
    }
    init(item) {
        var sprite = new createjs.Container(),
        shape = new createjs.Shape();
        sprite.addChild(shape);
        if (!item.visible) {
            sprite.visible = false;
        }
        this.stage.addChild(sprite);
        this.setSprite(item, sprite)
        this.setShape(item, shape)
        this.drawShape(item);
    }
    cleanup(item) {
        const s = this.getSprite(item)
        if (s) {
            this.stage.removeChild(s);
        }
    }
    setVisible(item) {
        const sprite = this.getSprite(item)
        if (sprite) {
            sprite.visible = item.visible;
        }
    }
    getSprite(item) {
        return this.renderer.getSprite(item)
    }
    getShape(item) {
        return this.renderer.getShape(item)
    }
    setSprite(item, s) {
        this.renderer.setSprite(item, s)
    }
    setShape(item, s) {
        this.renderer.setShape(item, s)
    }
    drawShape() {

    }
    render() {

    }
}

class RectangleParticleDelegate extends AbstractDelegate {
    drawShape(item) {
        var shape = this.getShape(item),
            g = shape.graphics,
            w = item.extents[0] * 2,
            h = item.extents[1] * 2;
        shape.x = -w / 2;
        shape.y = -h / 2;
        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness)
            g.beginStroke(createjs.Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(createjs.Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawRect(0, 0, w, h);
        g.endFill();
    }
    render(item) {
        var sprite = this.getSprite(item),
            x = item.curr.x,
            y = item.curr.y,
            w = item.extents[0] * 2,
            h = item.extents[1] * 2,
            r = item.angle;

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
        var r = item.radius,
            shape = this.getShape(item),
            g = shape.graphics;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness)
            g.beginStroke(createjs.Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(createjs.Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawCircle(0, 0, r);
        g.endFill();
    }
    render(item) {
        var x = item.curr.x,
            y = item.curr.y,
            sprite = this.getSprite(item)

        if (sprite) {
            this.drawShape(item);
            sprite.x = x;
            sprite.y = y;
        }
    }
}

class WheelParticleDelegate extends AbstractDelegate {
    drawShape(item) {
        var r = item.radius,
            shape = this.getShape(item),
            g = shape.graphics;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness);
            g.beginStroke(createjs.Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.beginFill(createjs.Graphics.getRGB(item.fillColor, item.fillAlpha));
        g.drawCircle(0, 0, r);

        g.setStrokeStyle(1);
        g.beginStroke(createjs.Graphics.getRGB(0xffffff - item.lineColor));
        g.moveTo(-r, 0);
        g.lineTo(r, 0);
        g.moveTo(0, -r);
        g.lineTo(0, r);
        g.endFill();
    }
    render(item) {
        var x = item.curr.x,
            y = item.curr.y,
            r = item.angle,
            sprite = this.getSprite(item);

        if (sprite) {
            this.drawShape(item);
            sprite.rotation = r;
            sprite.x = x;
            sprite.y = y;
        }

    }
}

class SpringConstraintParticleDelegate extends AbstractDelegate {
    init(item) {
        var inner = new createjs.Container(),
            shape = new createjs.Shape(),
            parent = item.parent,
            parentSprite = this.getSprite(parent)
        if (!parentSprite) {
            parentSprite = new createjs.Container();
            this.setSprite(parent, parentSprite);
        }
        this.setSprite(item, inner)
        this.setShape(item, shape)
        if (!item.visible) {
            sprite.visible = false;
        }
        inner.addChild(shape);
        parentSprite.addChild(inner);
        this.drawShape(item);
        this.stage.addChild(parentSprite);
    }
    cleanup(item) {
        var parent = item.parent;
        this.stage.removeChild(this.getSprite(parent));
    }
    drawShape(item) {
        var shape = this.getShape(item),
            g = shape.graphics,
            parent = item.parent,
            c = parent.center,
            w = parent.currLength * item.rectScale,
            h = item.rectHeight;

        g.clear();
        if (parent.lineThickness) {
            g.setStrokeStyle(parent.lineThickness);
            g.beginStroke(createjs.Graphics.getRGB(parent.lineColor, parent.lineAlpha));
        }
        g.beginFill(createjs.Graphics.getRGB(parent.fillColor, parent.fillAlpha));
        g.drawRect(-w / 2, -h / 2, w, h);
        g.endFill();
    }
    render(item) {
        var parent = item.parent,
            c = parent.center,
            s = this.getSprite(item)

        s.x = c.x;
        s.y = c.y;
        if (item.scaleToLength) {
            s.width = parent.currLength * item.rectScale;
        }
        s.rotation = parent.angle;
    }
}

class SpringConstraintDelegate extends AbstractDelegate {
    init() {

    }
    cleanup(item) {
        var sprite = this.getSprite(item)
        if (sprite) {
            this.stage.removeChild(sprite);
        }
    }
    initShape(item) {
        var sprite = new createjs.Container(),
            shape = new createjs.Shape();
        this.setSprite(item, sprite)
        this.setShape(item, shape)
        sprite.addChild(shape);
        this.stage.addChild(sprite);
    }
    drawShape(item) {
        var shape = this.getShape(item),
            g = shape.graphics,
            p1 = item.p1,
            p2 = item.p2;

        g.clear();
        if (item.lineThickness) {
            g.setStrokeStyle(item.lineThickness);
            g.beginStroke(createjs.Graphics.getRGB(item.lineColor, item.lineAlpha));
        }
        g.moveTo(p1.px, p1.py);
        g.lineTo(p2.px, p2.py);
        g.endFill();
    }
    render(item) {
        if (item.collidable) {
            item.scp.paint();
        } else {
            if (!this.getShape(item)) {
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
        this.sMap = new Map()
        this.pMap = new Map()
        this.rpd = new RectangleParticleDelegate(this)
        this.cpd = new CircleParticleDelegate(this)
        this.wpd = new WheelParticleDelegate(this)
        this.scpd = new SpringConstraintParticleDelegate(this)
        this.scd = new SpringConstraintDelegate(this)
    }
    findDelegate(item) {
        if (item instanceof SpringConstraintParticle) {
            return this.scpd
        }
        if (item instanceof SpringConstraint) {
            return this.scd
        }
        if(item instanceof WheelParticle) {
            return this.wpd
        }
        if (item instanceof RectangleParticle) {
            return this.rpd
        }
        if (item instanceof CircleParticle) {
            return this.cpd
        }
    }
    setSprite(item, sprite) {
        this.sMap.set(item, sprite)
    }
    getSprite(item, sprite) {
        return this.sMap.get(item)
    }
    setShape(item, shape) {
        this.pMap.set(item, shape)
    }
    getShape(item, shape) {
        return this.pMap.get(item)
    }
    init(item) {
        this.findDelegate(item).init(item)
    }
    cleanup(item) {
        this.findDelegate(item).cleanup(item)
    }
    drawShape(item) {
        this.findDelegate(item).drawShape(item)
    }
    render(item) {
        this.findDelegate(item).render(item)
    }
}

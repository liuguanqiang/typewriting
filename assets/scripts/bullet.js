cc.Class({
    extends: cc.Component,

    properties: {
    },

    start() {
        this.speed = 40;
    },
    setTarget(traget, initPoint, cb) {
        if (initPoint != 0) {
            this.node.setPosition(0, 0);
            this.node.setPosition(this.node.convertToNodeSpaceAR(initPoint));
        }
        this.traget = traget;
        this.isUpdate = true;
        this.cb = cb;
    },
    update(dt) {
        if (!this.traget || !this.isUpdate) return;
        let targetPoint = this.traget.getComponent("letterRect").getBullseyePosition();
        let point = cc.v2(this.node.x, this.node.y);
        let distance = point.sub(targetPoint).mag();
        if (distance <= 30) {
            this.isUpdate = false;
            this.traget.getComponent("letterRect").setHit();
            this.node.destroy();
            return true;
        }
        let delta = targetPoint.sub(point);
        let x2 = point.x + this.speed * delta.x / distance;
        let y2 = point.y + this.speed * delta.y / distance;
        let newPosition = cc.v2(x2, y2);
        let x1 = point.x;
        let y1 = point.y;
        let deltaRotation = 90 - Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        this.node.rotation = deltaRotation;
        this.node.setPosition(newPosition);//设置跟踪导弹的位置
    },
});

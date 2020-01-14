cc.Class({
    extends: cc.Component,

    properties: {
        particle: cc.Prefab
    },

    start() {
        
    },
    onInit(tragetJS, initPoint, cb) {
        if (initPoint != 0) {
            this.node.rotation = 0;
            this.node.setPosition(0, 0);
            const point = this.node.convertToNodeSpaceAR(initPoint);
            this.node.setPosition(point);
        }
        this.node.addChild(cc.instantiate(this.particle));
        this.tragetJS = tragetJS;
        this.isUpdate = true;
        this.cb = cb;
    },
    update(dt) {
        if (!this.tragetJS || !this.isUpdate) return;
        let targetPoint = this.tragetJS.getBullseyePosition();
        let point = cc.v2(this.node.x, this.node.y);
        let distance = point.sub(targetPoint).mag();
        if (distance <= 30) {
            this.isUpdate = false;
            this.tragetJS.setHit();
            this.node.destroyAllChildren();
            if (this.cb) {
                this.cb(this.node);
            }
            return true;
        }
        let delta = targetPoint.sub(point);
        let x2 = point.x + this.tragetJS.bulletSpeed * delta.x / distance;
        let y2 = point.y + this.tragetJS.bulletSpeed * delta.y / distance;
        let newPosition = cc.v2(x2, y2);
        let x1 = point.x;
        let y1 = point.y;
        let deltaRotation = 90 - Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        this.node.rotation = deltaRotation;
        this.node.setPosition(newPosition);//设置跟踪导弹的位置
    },
});

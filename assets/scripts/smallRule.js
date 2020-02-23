var gameLocalData = require('gameLocalData');
cc.Class({
    extends: cc.Component,
    properties: {
    },

    start() {
    },
    onLoad() {
        this.fastSpeed = this.random(2, 4);
        this.slowSpeed = this.random(0.3, 0.8);
        this.init_y = this.node.y;
    },
    onPlay(isfast = true) {
        this.speed = isfast ? this.fastSpeed : this.slowSpeed;
        this.isPlay = true;
    },

    onStop() {
        this.isPlay = false;
    },
    //获取随机数
    random(lower, upper) {
        const random = Math.random() * (upper - lower) + lower;
        return random;
    },

    update(dt) {
        if (!this.isPlay || gameLocalData.IsPause) return;
        this.node.y -= this.speed;
        if (this.node.y <= -this.init_y) {
            this.node.y = this.init_y;
        }
    },
});

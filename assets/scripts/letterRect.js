cc.Class({
    extends: cc.Component,

    properties: {
        letterLabel: cc.Node,
        particle: cc.Node,
        bg: cc.Node
    },

    start() {
    },
    onLoad() {
        this.normalColor = new cc.color(255, 255, 255, 255);
        this.anchorColor = new cc.color(255, 120, 0, 255);
    },

    //初始化
    onInit(text, point, speed = 20) {
        this.bg.active = true;
        this.accelerate = 1;
        this.speed = speed;
        this.comLetterLabel = this.letterLabel.getComponent(cc.Label);
        this.curText = text;
        this.LetterCount = text.length;
        this.comLetterLabel.string = text;
        this.isPlay = true;
        this.node.setPosition(point);
        if (text.length > 1) {
            this.comLetterLabel._updateRenderData(true);
            this.bg.width = this.letterLabel.width + 20;
        }

        // this.rotateSprite.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(1, -180, -180), cc.rotateTo(1, -360, -360))));
    },

    //设置当前为定位字母块
    setAnchor(finish_cb) {
        this.finish_cb = finish_cb;
        this.bg.color = this.anchorColor;
        this.letterLabel.color = this.anchorColor;
        this.node.zIndex = 100;
    },

    //外部传入按键字母，进行删除当前字母块的首字母，如果不符合返回-1,
    removeCode(key) {
        if (this.getFristLetter() == key) {
            if (this.curText.length > 1) {
                this.curText = this.curText.substring(1, this.curText.length);
            } else {
                this.curText = ""
            }
            return this.curText.length;
        }
        return -1;
    },

    //获取首字母
    getFristLetter() {
        if (this.curText.length >= 1) {
            return this.curText[0];
        }
        return null;
    },

    //获取随机数
    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },

    //获取靶心坐标点
    getBullseyePosition() {
        return this.node.getPosition();
        // const nodePoint = this.node.getPosition();
        // return cc.v2(nodePoint.x + this.rotateSprite.x, nodePoint.y + this.rotateSprite.y);
    },

    //被击中
    setHit() {
        if (!this.LetterCount) {
            return;
        }
        this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string.length);
        if (this.LetterCount === 1) {
            this.onPlayParticle();
            if (this.finish_cb) {
                this.finish_cb();
            }
        } else {
            this.LetterCount--;
        }
    },

    //播放爆炸效果，发送回收回调
    onPlayParticle() {
        this.isPlay = false;
        this.bg.active = false;
        const comParticle = this.particle.getComponent(cc.ParticleSystem);
        comParticle.resetSystem();
        setTimeout(() => {
            comParticle.stopSystem();
            this.node.destroy();
        }, 800);
    },

    //加速一次
    onAccelerate() {
        this.accelerate = 10;
    },

    update(dt) {
        if (!this.isPlay) return;
        if (this.accelerate > 1) {
            this.node.y -= this.speed * this.accelerate * dt;
            this.accelerate--;
        } else {
            this.node.y -= this.speed * dt;
        }
    },
});

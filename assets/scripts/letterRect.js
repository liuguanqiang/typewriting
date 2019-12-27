cc.Class({
    extends: cc.Component,

    properties: {
        letterLabel: cc.Node,
        particle: cc.Node,
    },

    start() {

    },

    onLoad() {
        this.normalColor = new cc.color(255, 255, 255, 255);
        this.anchorColor = new cc.color(255, 120, 0, 255);
    },

    //初始化
    onInit(text, xPoint, speed = 20) {
        this.node.isFinish = false;
        this.node.setPosition(0, 368);
        this.node.zIndex = 0;
        this.node.color = this.normalColor;
        this.letterLabel.color = this.normalColor;
        this.accelerate = 1;
        this.speed = speed;
        this.comLetterLabel = this.letterLabel.getComponent(cc.Label);
        this.curText = text;
        this.LetterCount = text.length;
        this.comLetterLabel.string = text;
        this.isPlay = true;
        this.node.x = xPoint;
        // this.comLetterLabel._updateRenderData(true);
        // this.node.width = this.letterLabel.width + 20;
        // this.rotateSprite.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(1, -180, -180), cc.rotateTo(1, -360, -360))));
    },

    //设置当前为定位字母块
    setAnchor(cb) {
        this.cb = cb;
        this.node.color = this.anchorColor;
        this.letterLabel.color = this.anchorColor;
        this.node.zIndex = 100;
    },

    //外部传入按键字母，进行删除当前字母块的首字母，如果不符合返回-1,
    removeCode(key) {
        if (this.getFristLetter() == key) {
            if (this.curText.length > 1) {
                this.curText = this.curText.substring(1, this.curText);
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
        this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string);
        if (this.LetterCount === 1) {
            if (this.cb) {
                this.cb(this.node);
            }
        } else {
            this.LetterCount--;
        }
    },

    //加速一次
    onAccelerate() {
        this.accelerate = 10;
    },

    //播放粒子
    playParticle() {
        const myParticle = this.particle.getComponent(cc.ParticleSystem);
        if (myParticle.particleCount > 0) {
            myParticle.stopSystem();
        } else {
            myParticle.resetSystem();
        }
    },

    update(dt) {
        if (!this.isPlay) return;
        if (this.accelerate > 1) {
            this.accelerate--;
            this.node.y -= this.speed * 5 * dt;
        } else {
            this.node.y -= this.speed * dt;
        }
    },
});

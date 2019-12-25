cc.Class({
    extends: cc.Component,

    properties: {
        rotateSprite: cc.Node,
        letterLabel: cc.Node,
        speed: 6
    },

    start() {

    },

    onInit(text, timeOut) {
        this.comLetterLabel = this.letterLabel.getComponent(cc.Label);
        if (text) {
            this.LetterCount = text.length;
            this.comLetterLabel.string = text;
            this.comLetterLabel._updateRenderData(true);
            this.node.width = this.letterLabel.width + 20;
            setTimeout(() => {
                this.isPlay = true;
            }, timeOut * 1000);
            this.node.x = this.random(-400, 400);
        }
        this.rotateSprite.runAction(cc.repeatForever(cc.sequence(cc.rotateTo(1, -180, -180), cc.rotateTo(1, -360, -360))));
    },

    //设置当前为定位字母块
    setAnchor() {
        this.letterLabel.color = new cc.color(255, 120, 0, 255);
        this.node.zIndex = 100;
    },

    //外部传入按键字母，进行删除当前字母块的首字母，如果不符合返回-1,
    removeCode(key) {
        if (this.getFristLetter() == key) {
            if (this.comLetterLabel.string.length > 1) {
                this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string.length);
            } else {
                this.comLetterLabel.string = ""
            }
            return this.comLetterLabel.string.length || 0;
        }
        return -1;
    },

    //获取首字母
    getFristLetter() {
        if (this.comLetterLabel.string.length >= 1) {
            return this.comLetterLabel.string[0];
        }
        return null;
    },

    //获取随机数
    random(lower, upper) {
        return Math.floor(Math.random() * (upper - lower)) + lower;
    },

    //获取靶心坐标点
    getBullseyePosition() {
        const nodePoint = this.node.getPosition();
        return cc.v2(nodePoint.x + this.rotateSprite.x, nodePoint.y + this.rotateSprite.y);
    },

    //被击中
    setHit() {
        if (!this.LetterCount) {
            return;
        }
        if (this.LetterCount === 1) {
            setTimeout(() => {
                if (cc.isValid(this.node)) {
                    this.node.destroy();
                }
            }, 200);
        } else {
            this.LetterCount--;
        }
    },

    update(dt) {
        if (!this.isPlay) return;
        this.node.y -= this.speed * dt;
    },
});

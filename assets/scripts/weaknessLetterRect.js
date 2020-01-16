cc.Class({
    extends: cc.Component,
    properties: {
        letterLabel: cc.Node,
        bg: cc.Node,
        activeBg: cc.Node,
    },

    start() {
    },
    onLoad() {
        this.anchorColor = new cc.color(255, 255, 255, 255);
    },

    //初始化
    onInit(point, finish_cb, bgIndex = 0) {
        this.finish_cb = finish_cb;
        this.node.setPosition(point);
    },

    onSetText(text) {
        this.comLetterLabel = this.letterLabel.getComponent(cc.Label);
        this.curText = text;
        this.LetterCount = text.length;
        this.comLetterLabel.string = text;
        if (text.length > 1) {
            this.comLetterLabel._updateRenderData(true);
            this.bg.width = this.letterLabel.width + 30;
        }
    },

    //设置高亮
    onSetHigh() {
        this.node.isHigh = true;
        this.node.stopAllActions();
        this.activeBg.active = true;
        this.letterLabel.color = this.anchorColor;
    },

    //设置闪烁
    onFlicker() {
        this.bg.runAction(cc.repeatForever(cc.sequence(cc.tintTo(0.2, 57, 178, 255), cc.tintTo(0.2, 61, 96, 211))));
    },

    //外部传入按键字母，进行删除当前字母块的首字母，如果不符合返回-1,
    removeCode(key) {
        if (this.getFristLetter() == key) {
            if (this.curText.length > 1) {
                this.curText = this.curText.substring(1, this.curText.length);

            } else {
                this.curText = ""
                // this.particle.getComponent(cc.ParticleSystem).resetSystem();
                if (this.finish_cb) {
                    this.finish_cb();
                }
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

    //获取靶心坐标点
    getBullseyePosition() {
        return this.node.getPosition();
    },
});

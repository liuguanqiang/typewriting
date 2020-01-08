cc.Class({
    extends: cc.Component,
    properties: {
        letterLabel: cc.Node,
        particle: cc.Node,
        bg: cc.Node,
        bgSpriteFrame: [cc.SpriteFrame]
    },

    start() {
    },
    onLoad() {
    },

    //初始化
    //isBrught 爽爆模式  不等子弹直接删除首字符
    onInit(point, finish_cb, bgIndex = 0, isBrught = false) {
        this.isBrught = isBrught;
        this.finish_cb = finish_cb;
        this.node.setPosition(point);
        this.bg.getComponent(cc.Sprite).spriteFrame = this.bgSpriteFrame[bgIndex];
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

    //外部传入按键字母，进行删除当前字母块的首字母，如果不符合返回-1,
    removeCode(key) {
        if (this.getFristLetter() == key) {
            if (this.curText.length > 1) {
                this.curText = this.curText.substring(1, this.curText.length);
                if (this.isBrught) {
                    this.comLetterLabel.string = this.curText;
                }
            } else {
                this.curText = ""
                if (this.isBrught) {
                    this.comLetterLabel.string = this.curText;
                    this.particle.getComponent(cc.ParticleSystem).resetSystem();
                    if (this.finish_cb) {
                        this.finish_cb();
                    }
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

    //被击中
    setHit() {
        if (!this.LetterCount || this.isBrught) {
            return;
        }
        this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string.length);
        if (this.LetterCount === 1) {
            this.particle.getComponent(cc.ParticleSystem).resetSystem();
            let finished = cc.callFunc(() => {
                if (this.finish_cb) {
                    this.finish_cb();
                }
            }, this);
            this.bg.getChildByName("letterLabel").runAction(cc.sequence(cc.fadeOut(0.1), cc.fadeIn(0.1), finished));
        } else {
            this.LetterCount--;
        }
    },
});

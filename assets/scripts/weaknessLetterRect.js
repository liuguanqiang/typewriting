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
    onInit(point, finish_cb, bgIndex = 0) {
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
            this.bg.width = this.letterLabel.width + 20;
        }
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

    //获取靶心坐标点
    getBullseyePosition() {
        return this.node.getPosition();
    },

    //被击中
    setHit() {
        if (!this.LetterCount) {
            return;
        }
        this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string.length);
        if (this.LetterCount === 1) {
            this.onPlayParticle();
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


    //播放爆炸效果，发送回收回调
    onPlayParticle() {
        const comParticle = this.particle.getComponent(cc.ParticleSystem);
        comParticle.resetSystem();
        // setTimeout(() => {
        //     if (cc.isValid(this.node)) {
        //         comParticle.stopSystem();
        //         this.node.destroy();
        //     }
        // }, 1000);
    },

});

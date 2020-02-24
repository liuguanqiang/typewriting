var gameLocalData = require('gameLocalData');
cc.Class({
    extends: cc.Component,

    properties: {
        letterLabel: cc.Node,
        particle: cc.Node,
        bg: cc.Node,
        activeBg: cc.Node,
    },

    start() {
    },
    onLoad() {
        this.anchorColor = new cc.color(219, 25, 123, 255);
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
        this.node.setPosition(point);
        if (text.length > 1) {
            this.comLetterLabel._updateRenderData(true);
            const w = this.letterLabel.width > 20 ? this.letterLabel.width : 20;
            this.bg.width = w + 40;
        }
        if (this.speed != -1) {
            this.isPlay = true;
        }
        this.maxY = 200 - this.node.parent.height / 2 + this.node.height / 2;
    },

    //设置当前为定位字母块
    setAnchor(finish_cb, lose_cb) {
        this.finish_cb = finish_cb;
        this.lose_cb = lose_cb;
        //this.activeBg.active = true;
        this.bg.color = this.anchorColor;
        this.letterLabel.color = this.anchorColor;
        this.node.zIndex = 100;
    },

    onStop() {
        this.isPlay = false;
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
    setHit(stallIndex) {
        if (!this.LetterCount) {
            return;
        }
        this.comLetterLabel.string = this.comLetterLabel.string.substring(1, this.comLetterLabel.string.length);
        if (this.LetterCount === 1) {
            this.onPlayParticle(stallIndex);
            if (this.finish_cb) {
                this.finish_cb();
            }
        } else {
            this.LetterCount--;
        }
    },

    //播放爆炸效果，发送回收回调
    onPlayParticle(stallIndex) {
        this.isPlay = false;
        this.bg.active = false;
        const comParticle = this.particle.getComponent(cc.ParticleSystem);
        this.onSetParticleStyle(stallIndex, comParticle)
        comParticle.resetSystem();
        setTimeout(() => {
            if (cc.isValid(this.node)) {
                comParticle.stopSystem();
                this.node.destroy();
            }
        }, 1000);
    },

    onSetParticleStyle(stallIndex, comParticle) {
        if (stallIndex === 1) {
            comParticle.lifeVar = 0.44;
            comParticle.totalParticles = 200;
            comParticle.speed = 40;
            comParticle.speedVar = 300;
        } else if (stallIndex === 2) {
            comParticle.lifeVar = 0.55;
            comParticle.totalParticles = 250;
            comParticle.speed = 45;
            comParticle.speedVar = 360;
        } else if (stallIndex === 3) {
            comParticle.lifeVar = 0.66;
            comParticle.totalParticles = 381;
            comParticle.speed = 70;
            comParticle.speedVar = 560;
        } else {
            comParticle.lifeVar = 0.77;
            comParticle.totalParticles = 381;
            comParticle.speed = 100;
            comParticle.speedVar = 666;
        }
    },

    //加速一次
    onAccelerate() {
        this.accelerate = 5;
    },

    update(dt) {
        if (!this.isPlay || gameLocalData.IsPause) return;
        if (this.accelerate > 1) {
            this.node.y -= this.speed * this.accelerate * dt;
            this.accelerate--;
        } else {
            this.node.y -= this.speed * dt;
        }
        //碰触到键盘了  失败
        if (this.node.y <= this.maxY && this.lose_cb) {
            this.lose_cb();
        }
    },
});

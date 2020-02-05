cc.Class({
    extends: cc.Component,
    properties: {
        starFrame: cc.SpriteFrame,
        tickrFrames: [cc.SpriteFrame],
        starContent: cc.Node,
        tickContent: cc.Node,
        twoStarAccuracy: cc.Node,
        threeStarAccuracy: cc.Node,
        threeStarTime: cc.Node,
    },
    start() {

    },
    onInit(starNum, data, cb) {
        this.twoStarAccuracy.getComponent(cc.Label).string = data.twoStars * 100 + "%";
        this.threeStarAccuracy.getComponent(cc.Label).string = data.threeStars.accuracy * 100 + "%";
        this.threeStarTime.getComponent(cc.Label).string = data.threeStars.time + "s";
        this.cb = cb;
        this.anim = this.node.getComponent(cc.Animation);
        this.anim.play();
        if (starNum > this.starContent.children.length) { return; }
        for (let i = 0; i < starNum; i++) {
            const star = this.starContent.children[i];
            star.getComponent(cc.Sprite).spriteFrame = this.starFrame;
            setTimeout(() => {
                star.runAction(cc.fadeTo(0.25, 255));
            }, i * 250 + 500);
            this.tickContent.children[i].getComponent(cc.Sprite).spriteFrame = this.tickrFrame;
        }
        for (let i = 0; i < this.tickContent.children.length; i++) {
            const tick = this.tickContent.children[i];
            tick.getComponent(cc.Sprite).spriteFrame = i < starNum ? this.tickrFrames[1] : this.tickrFrames[0];
        }
        setTimeout(() => {
            this.anim.play('winEnd');
        }, starNum * 300 + 500);
    },
    onHome() {
        this.cb(1);
    },
    onAgain() {
        this.cb(2);
    },
    onNext() {
        this.cb(3);
    }
});

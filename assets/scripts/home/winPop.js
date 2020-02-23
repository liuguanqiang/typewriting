cc.Class({
    extends: cc.Component,
    properties: {
        starFrames: [cc.SpriteFrame],
        tickrFrames: [cc.SpriteFrame],
        starContent: cc.Node,
        tickContent: cc.Node,
        twoStarAccuracy: cc.Node,
        threeStarAccuracy: cc.Node,
        threeStarTime: cc.Node,
        diademaFrames: [cc.SpriteFrame],
        smallStarFrames: [cc.SpriteFrame],
        starEmpty: cc.Node,
        smallStarContent: cc.Node,
        btns: cc.Node,
    },
    start() {

    },
    onInit(starNum, isThreeAccuracy, isThreeHitTimeOffset, data, isBoss, cb) {
        console.log("data",data)
        console.log("isThreeAccuracy",isThreeAccuracy)
        console.log("isThreeHitTimeOffset",isThreeHitTimeOffset)
        console.log("starNum",starNum)
        for (let i = 0; i < 3; i++) {
            const star0 = this.starEmpty.children[i];
            const star1 = this.starContent.children[i];
            const star2 = this.smallStarContent.children[i];
            const btn = this.btns.children[i];
            if (isBoss) {
                star0.getComponent(cc.Sprite).spriteFrame = this.diademaFrames[0];
                star0.setContentSize(137, 108);
                star1.getComponent(cc.Sprite).spriteFrame = this.diademaFrames[1];
                star1.setContentSize(137, 108);
                star2.getComponent(cc.Sprite).spriteFrame = this.smallStarFrames[1];
                star2.setContentSize(50, 39);
                if (i == 0) {
                    btn.x = -80;
                } else if (i == 1) {
                    btn.x = 80;
                } else {
                    btn.active = false;
                }
            } else {
                star0.getComponent(cc.Sprite).spriteFrame = this.starFrames[0];
                star0.setContentSize(138, 139);
                star1.getComponent(cc.Sprite).spriteFrame = this.starFrames[1];
                star1.setContentSize(138, 139);
                star2.getComponent(cc.Sprite).spriteFrame = this.smallStarFrames[0];
                star2.setContentSize(50, 50);
                if (i == 0) {
                    btn.x = -170;
                } else if (i == 1) {
                    btn.x = 0;
                } else {
                    btn.active = true;
                }
            }
        }

        this.twoStarAccuracy.getComponent(cc.Label).string = data.twoStars * 100 + "%";
        this.threeStarAccuracy.getComponent(cc.Label).string = data.threeStars.accuracy * 100 + "%";
        this.threeStarTime.getComponent(cc.Label).string = data.threeStars.time + "s";
        this.cb = cb;
        this.anim = this.node.getComponent(cc.Animation);
        this.anim.play();
        if (starNum > this.starContent.children.length) { return; }
        for (let i = 0; i < starNum; i++) {
            const star = this.starContent.children[i];
            setTimeout(() => {
                star.runAction(cc.fadeTo(0.25, 255));
            }, i * 250 + 500);
        }
        if (starNum <= 1) {
            for (let i = 0; i < this.tickContent.children.length; i++) {
                const tick = this.tickContent.children[i];
                tick.getComponent(cc.Sprite).spriteFrame = i < starNum ? this.tickrFrames[1] : this.tickrFrames[0];
            }
        } else if (starNum == 2) {
            for (let i = 0; i < this.tickContent.children.length; i++) {
                const tick = this.tickContent.children[i];
                if (i < 2) {
                    tick.getComponent(cc.Sprite).spriteFrame = this.tickrFrames[1];
                } else if (i == 2) {
                    tick.getComponent(cc.Sprite).spriteFrame = isThreeAccuracy ? this.tickrFrames[1] : this.tickrFrames[0];
                } else if (i == 3) {
                    tick.getComponent(cc.Sprite).spriteFrame = isThreeHitTimeOffset ? this.tickrFrames[1] : this.tickrFrames[0];
                }
            }
        } else {
            for (let i = 0; i < this.tickContent.children.length; i++) {
                const tick = this.tickContent.children[i];
                tick.getComponent(cc.Sprite).spriteFrame = this.tickrFrames[1];
            }
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

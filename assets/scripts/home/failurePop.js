
cc.Class({
    extends: cc.Component,

    properties: {
        progressNode: cc.Node,
        bossImg: cc.Node,
        bossIcon: cc.Node,
        btns: cc.Node,
        bossFrames: [cc.SpriteFrame],
    },
    start() {

    },
    onDefault() {
        this.progressNode.opacity = 0;
        this.progressNode.getComponent(cc.ProgressBar).progress = 0;
        this.btns.opacity = 0;
        this.bossImg.setScale(0);
    },
    onInit(progress, chapterId, cb) {
        this.bossIcon.getComponent(cc.Sprite).spriteFrame = this.bossFrames[chapterId];
        const bossSize = [{ x: 184, y: 165 }, { x: 203, y: 161 }, { x: 203, y: 113 }, { x: 203, y: 185 }, { x: 203, y: 203 }];
        this.bossIcon.setContentSize(bossSize[chapterId].x, bossSize[chapterId].y);
        this.bossImg.runAction(cc.scaleTo(0.5, 1, 1).easing(cc.easeIn(3)));
        setTimeout(() => {
            this.progressNode.opacity = 255;
            this.schedule(function () {
                const curProgress = this.progressNode.getComponent(cc.ProgressBar).progress + 0.05;
                if (curProgress < progress) {
                    this.progressNode.getComponent(cc.ProgressBar).progress = curProgress;
                } else {
                    this.unscheduleAllCallbacks(this);
                    this.progressNode.getComponent(cc.ProgressBar).progress = progress;
                    setTimeout(() => {
                        this.btns.opacity = 255;
                    }, 100);
                }
            }, 0.025);
        }, 600);
        this.cb = cb;
    },
    onHome() {
        this.cb(1);
    },
    onAgain() {
        this.cb(2);
    },
});

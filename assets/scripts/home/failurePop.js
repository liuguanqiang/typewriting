
cc.Class({
    extends: cc.Component,

    properties: {
        progressNode: cc.Node,
        bossImg: cc.Node,
        btns: cc.Node,
    },
    start() {

    },
    onDefault() {
        this.progressNode.opacity = 0;
        this.progressNode.getComponent(cc.ProgressBar).progress = 0;
        this.btns.opacity = 0;
        this.bossImg.setScale(0);
    },
    onInit(progress, cb) {
        this.bossImg.runAction(cc.scaleTo(0.5, 1, 1).easing(cc.easeIn(3)));
        setTimeout(() => {
            this.progressNode.opacity = 255;
            this.schedule(function () {
                this.progressNode.getComponent(cc.ProgressBar).progress += progress / 20;
            }, 0.025, 19, 0);
        }, 500);
        setTimeout(() => {
            this.btns.opacity = 255;
        }, 1500);
        this.cb = cb;
    },
    onHome() {
        this.cb(1);
    },
    onAgain() {
        this.cb(2);
    },
});

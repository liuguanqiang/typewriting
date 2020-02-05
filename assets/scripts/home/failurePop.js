
cc.Class({
    extends: cc.Component,

    properties: {
        progressNode: cc.Node
    },
    start() {

    },
    onInit(progress, cb) {
        this.progressNode.getComponent(cc.ProgressBar).progress = progress;
        this.cb = cb;
    },
    onHome() {
        this.cb(1);
    },
    onAgain() {
        this.cb(2);
    },
});

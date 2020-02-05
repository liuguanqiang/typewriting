
cc.Class({
    extends: cc.Component,

    properties: {

    },
    start() {

    },
    onInit(cb) {
        this.cb = cb;
    },
    onHome() {
        this.cb(1);
    },
    onPlay() {
        this.cb(2);
    },
});

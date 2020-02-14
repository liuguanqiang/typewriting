var localData = require('localData');
cc.Class({
    extends: cc.Component,
    properties: {
        http: cc.Node,
        audio: cc.Node,
        user: cc.Node,
    },
    onLoad() {

    },
    initPersistRootNode() {
        cc.game.addPersistRootNode(this.node);
        this.getHttpJS().initHttp();
    },

    // ---------------------------------- service ----------------------------------
    getHttpJS() {
        return this.http.getComponent("httpService");
    },

    getAudioJS() {
        return this.audio.getComponent("gameAudio");
    },
    getUserJS() {
        return this.user.getComponent("userService");
    },
});
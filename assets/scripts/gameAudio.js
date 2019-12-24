cc.Class({
    extends: cc.Component,

    properties: {
        bullet: cc.AudioClip
    },

    start() {

    },

    //播放子弹音效
    onPlayBullet() {
        cc.audioEngine.playEffect(this.bullet, false);
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        bullet: cc.AudioClip,//子弹
        keyError: cc.AudioClip,//按错键
        win: cc.AudioClip,//胜利
        lose: cc.AudioClip,//失败
        bossAppear: cc.AudioClip,//boss出现
        bossStage1: cc.AudioClip,//boss阶段1
        bossExplode: cc.AudioClip,//boss爆炸
    },

    start() {

    },

    //播放boss阶段1背景音乐
    onPlayBossStage1() {
        cc.audioEngine.playMusic(this.bossStage1, true);
        cc.audioEngine.setMusicVolume(0.5);
    },

    //播放子弹音效
    onPlayBullet() {
        cc.audioEngine.playEffect(this.bullet, false);
    },

    //播放按错键音效
    onPlayKeyError() {
        cc.audioEngine.playEffect(this.keyError, false);
    },

    //播放胜利音效
    onPlayWin() {
        cc.audioEngine.playEffect(this.win, false);
    },

    //播放失败音效
    onPlayLose() {
        cc.audioEngine.playEffect(this.lose, false);
    },

    //播放boss出现音效
    onPlayBossAppear() {
        cc.audioEngine.playEffect(this.bossAppear, false);
    },

    //播放boss爆炸音效
    onPlayBossExplode() {
        cc.audioEngine.playEffect(this.bossExplode, false);
    },

    //停止播放所有音乐
    onStopAllEffects(){
        cc.audioEngine.stopAllEffects();
    }

});

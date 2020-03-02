cc.Class({
    extends: cc.Component,

    properties: {
        bullet: cc.AudioClip,//子弹
        keyError: cc.AudioClip,//按错键
        win: cc.AudioClip,//胜利
        lose: cc.AudioClip,//失败
        bossAppear: cc.AudioClip,//boss出现
        bossExplode: cc.AudioClip,//boss爆炸
        QTEAppear: cc.AudioClip,//QTE进入
        bossBG: cc.AudioClip,//boss背景音
        QTEBG: cc.AudioClip,//QTE背景音
        exerciseBG: cc.AudioClip,//练习关卡背景音
        homeBG: cc.AudioClip,//主页背景音
        btn: cc.AudioClip,//按钮音
    },

    start() {

    },

    //播放boss阶段背景音乐
    onPlayBossBG() {
        cc.audioEngine.playMusic(this.bossBG, true);
    },

    //播放QTE背景音乐
    onPlayQTEBG() {
        cc.audioEngine.playMusic(this.QTEBG, true);
    },

    //播放练习关卡背景音乐
    onPlayExerciseBG() {
        cc.audioEngine.playMusic(this.exerciseBG, true);
    },

    //播放主页背景音
    onPlayHomeBG() {
        cc.audioEngine.playMusic(this.homeBG, true);
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

    //播放按钮点击音效
    onPlayBtn() {
        cc.audioEngine.playEffect(this.btn, false);
    },

    //播放QTE进入音效
    onPlayQTEAppear() {
        cc.audioEngine.playEffect(this.QTEAppear, false);
    },

    //停止播放所有音频
    onStopAllEffects() {
        cc.audioEngine.stopAllEffects();
    },
    //停止播放背景音乐
    onStopMusic() {
        cc.audioEngine.stopMusic();
    }
});

//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,

    properties: {
        CrabBoss: cc.Prefab,
    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        if (gameJS.Bosslayer && gameJS.Bosslayer.children.length > 0) {
            this.bossNode = this.gameJS.Bosslayer.children[0];
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.data = gameJS.getCurLevelData().boss.beatingState;
            this.blood = gameJS.getCurLevelData().boss.blood;
            this.scoreLabel = gameJS.Score.getComponent(cc.Label);
            this.score = 0;
        }
        //当前分数
        this.y = this.bossNode.y + 37;
        this.onUpdatePoolData();
        this.onPlayAnimation();
    },


    //获取对应刷新池数据
    onUpdatePoolData() {
        this.unscheduleAllCallbacks(this);
        //当前字母块正常池
        this.curNormalLetterPool = this.data.normal;
        //当前打怪时间s
        this.curBeatTime = this.data.beatTime;
        this.isPlay = true;
        this.timeOut = setTimeout(() => {
            this.gameOver();
        }, this.curBeatTime * 1000);
    },

    //开始播放boss动画 并发送字符
    onPlayAnimation() {
        this.bossAnim.play('bloodBreathe');
        this.createLetterItem();
    },

    //创建字母块
    createLetterItem() {
        if (!this.isPlay) return;
        const item = this.gameJS.createLetterItem();
        const letterText = this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
        item.getComponent("letterRect").onInit(letterText, cc.v2(0, this.y), -1);
        this.gameJS.onAutoLocation();
    },

    //打错 惩罚直接返回攻击模式
    punishmentOnce() {
        this.bossAnim.stop();
        clearTimeout(this.timeOut);
        setTimeout(() => {
            this.gameOver();
        }, 500);
    },

    gameOver() {
        if (this.isPlay) {
            this.isPlay = false;
            this.gameJS.onBack(-1);
        }
    },

    //打完一个字母
    finishOnce() {
        this.gameJS.Blood.getComponent(cc.ProgressBar).progress -= 1 / this.blood;
        this.createLetterItem();
    },
});

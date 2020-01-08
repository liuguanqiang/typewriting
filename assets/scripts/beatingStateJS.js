//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,

    properties: {
        Blood: cc.Node,
        HaemalCountLabel: cc.Node,
        whiltBar: cc.Node,
        WeaknessLetterRect: cc.Prefab
    },

    start() {
        this.isInit = false;
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        this.Blood.active = true;
        if (!this.isInit) {
            this.isInit = true;
            this.bossNode = this.gameJS.Bosslayer.children[0];
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.data = gameJS.getCurLevelData().boss.beatingState;
            this.sumBlood = gameJS.getCurLevelData().boss.blood;
            this.residueBlood = this.sumBlood;
            this.HaemalCountLabel.getComponent(cc.Label).string = "X" + this.sumBlood / 10;
        }
        this.bossNode.getChildByName("weakness").active = true;
        this.y = this.bossNode.y + 33;
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
            this.isPlay = false;
            this.gameOver();
        }, this.curBeatTime * 1000);
    },

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("weaknessLetterRect");
        const length = curAnchorLetterJS.removeCode(code);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.bulletSpeed = 60;
        return curAnchorLetterJS;
    },

    //失败了 停止游戏
    onLose() {
        this.isPlay = false;
        this.bossAnim.stop();
        clearTimeout(this.timeOut);
    },

    //开始播放boss动画 并发送字符
    onPlayAnimation() {
        this.bossAnim.play('weakness');
        setTimeout(() => {
            this.bossNode.getChildByName("weakness").active = false;
            this.createLetterItem();
        }, 1200);
    },

    //创建字母块
    createLetterItem() {
        if (!this.isPlay) return;
        this.letterRect = cc.instantiate(this.WeaknessLetterRect);
        this.gameJS.LetterBoxs.addChild(this.letterRect);
        this.letterRect.getComponent("weaknessLetterRect").onInit(cc.v2(0, this.y), () => {
            this.finishOnce();
        }, 0, true);
        this.letterRect.getComponent("weaknessLetterRect").onSetText(this.getLetterText());
        this.gameJS.onSetAnchorLetter(this.letterRect);
    },

    //获取一个随机字符
    getLetterText() {
        return this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
    },

    //打错 惩罚直接返回攻击模式
    punishmentOnce() {
        this.isPlay = false;
        clearTimeout(this.timeOut);
        this.gameOver();
    },

    //挨打模式时间到了  或者打错了  直接返回攻击模式
    gameOver() {
        this.gameJS.canKeyDown = false;
        this.bossAnim.stop();
        this.bossAnim.play('sleepLightly');
        setTimeout(() => {
            this.gameJS.BulletsBoxs.destroyAllChildren();
            this.gameJS.LetterBoxs.destroyAllChildren();
        }, 100);

        setTimeout(() => {
            if (this.Blood.active) {
                this.Blood.active = false;
                this.gameJS.onBack(-1);
            }
        }, 3000);
    },

    //打完一个字母
    finishOnce() {
        --this.residueBlood;
        // this.whiltBar.x = (1 - this.Blood.getComponent(cc.ProgressBar).progress) * this.Blood.width - this.Blood.width / 2;
        // this.whiltBar.runAction(cc.sequence(cc.fadeIn(0.4), cc.fadeOut(0.1)));
        this.Blood.getComponent(cc.ProgressBar).progress -= 0.1;
        if (this.residueBlood == 0) {
            this.gameJS.onWin();
            return;
        }
        if (this.Blood.getComponent(cc.ProgressBar).progress < 0.05) {
            this.Blood.getComponent(cc.ProgressBar).progress = 1;
            this.HaemalCountLabel.getComponent(cc.Label).string = "X" + Math.floor(this.residueBlood / 10);
        }
        this.letterRect.getComponent("weaknessLetterRect").onSetText(this.getLetterText());
    },
});

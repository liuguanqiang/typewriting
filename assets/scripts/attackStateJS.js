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
        if (!gameJS.Bosslayer || gameJS.Bosslayer.children.length == 0) {
            this.bossNode = cc.instantiate(this.CrabBoss);
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.gameJS.Bosslayer.addChild(this.bossNode);
            this.initAnimation();
            this.data = gameJS.getCurLevelData().boss.attackState;
            this.speed = gameJS.getCurLevelData().speed;
            this.scoreLabel = gameJS.Score.getComponent(cc.Label);
            this.score = 0;
        }
        //当前分数
        this.onUpdatePoolData();
        this.animIndex = 0;
        this.onPlayAnimation();
    },

    initAnimation() {
        this.bossAnim.on('finished', (e) => {
            if (this.animIndex == 1) {
                this.createLetterItem(cc.v2(-212, 290));
            } else if (this.animIndex == 2) {
                this.createLetterItem(cc.v2(212, 290));
            }
            ++this.animIndex;
            this.onPlayAnimation();
        }, this);
    },


    //获取对应刷新池数据
    onUpdatePoolData() {
        this.isCreateOver = false;
        this.unscheduleAllCallbacks(this);
        //当前已创建字母块索引
        this.letterRectIndex = 0;
        //当前字母块正常池
        this.curNormalLetterPool = this.data.normal;
        //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
        this.curUpdateCount = this.data.updateCount;
    },

    //失败了 停止游戏
    onLose() {
        this.bossAnim.stop();
    },

    //开始播放boss动画 并发送字符
    onPlayAnimation() {
        if (this.animIndex > 2) {
            this.animIndex = 0;
        }
        if (this.animIndex == 0) {
            const animState = this.bossAnim.play('breathe');
            animState.wrapMode = cc.WrapMode.Loop;
            animState.repeatCount = 2;
            return;
        }
        if (this.animIndex == 1) {
            this.bossAnim.play('leftHand');
            return;
        }
        if (this.animIndex == 2) {
            this.bossAnim.play('rightHand');
            return;
        }
    },



    //创建字母块
    createLetterItem(point) {
        if (this.letterRectIndex < this.curUpdateCount) {
            const item = this.gameJS.createLetterItem();
            const letterText = this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
            item.getComponent("letterRect").onInit(letterText, point, this.speed);
            this.letterRectIndex++;
            this.gameJS.onAutoLocation();
            if (this.letterRectIndex == this.curUpdateCount) {
                this.isCreateOver = true;
            }
        }
    },

    //惩罚一次，当前刷新项+1
    punishmentOnce() {
        ++this.curUpdateCount;
        this.isCreateOver = false;
    },

    //打完一个字母
    finishOnce() {
        this.scoreLabel.string = ++this.score;
        //字母创建完成，检测字母是否都打击完毕
        if (!this.isCreateOver || !this.gameJS.getLettersAllFinish()) return;
        this.bossAnim.stop();
        setTimeout(() => {
            this.gameJS.onBack();
        }, 1000);
    },
});

//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,

    properties: {
        CrabBoss: cc.Prefab,
        EnergyProgressBar: cc.Node,
    },

    start() {
        this.animIndex = -1;
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        this.isStop = false;
        if (!gameJS.Bosslayer || gameJS.Bosslayer.children.length == 0) {
            this.gameJS.onPlayLighting();
            this.bossNode = cc.instantiate(this.CrabBoss);
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.gameJS.Bosslayer.addChild(this.bossNode);
            this.initAnimation();
            this.data = gameJS.getCurLevelData().boss.attackState;
            this.speed = gameJS.getCurLevelData().speed;
        }
        this.bossNode.getChildByName("weakness").active = false;
        this.EnergyProgressBar.active = true;
        this.EnergyProgressBar.getComponent(cc.ProgressBar).progress = 0;
        //当前分数
        this.onUpdatePoolData();
        if (this.animIndex == -1) {
            this.gameJS.AudioJS.onPlayBossAppear();
            this.bossAnim.play('walk');
            this.bossNode.runAction(cc.moveTo(2, 0, 250));
            setTimeout(() => {
                this.animIndex = 0;
                this.onPlayAnimation();
            }, 2000);
        } else {
            this.animIndex = 0;
            this.onPlayAnimation();
        }
    },

    initAnimation() {
        this.bossAnim.on('finished', (e) => {
            if (this.isStop) return;
            if (this.animIndex == 1) {
                this.createLetterItem(cc.v2(-212, 290));
            } else if (this.animIndex == 2) {
                this.createLetterItem(cc.v2(212, 290));
            }
            //如果创建完成 只做呼吸动画
            if (this.isCreateOver) {
                this.animIndex = 0;
            } else {
                ++this.animIndex;
            }
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

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("letterRect");
        const length = curAnchorLetterJS.removeCode(code);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.bulletSpeed = 40;
        return curAnchorLetterJS;
    },

    //失败了 停止游戏
    onLose() {
        this.isStop = true;
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
        // ++this.curUpdateCount;
        // this.isCreateOver = false;
    },

    //打完一个字母
    finishOnce() {
        this.EnergyProgressBar.getComponent(cc.ProgressBar).progress += 1 / this.curUpdateCount;
        //字母创建完成，检测字母是否都打击完毕
        if (!this.isCreateOver || !this.gameJS.getLettersAllFinish()) return;
        this.isStop = true;
        setTimeout(() => {
            this.gameJS.onBack();
            this.EnergyProgressBar.active = false;
        }, 1000);
    },
});

//boss练习关卡 操作类
require('gameWindowFun');
var gameLocalData = require('gameLocalData');
cc.Class({
    extends: cc.Component,

    properties: {
        Bosses: [cc.Prefab]
    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.isStop = false;
        const id = gameJS.getCurLevelData().id;
        if (this.id != id) {
            this.isFristInit = true;
            this.id = id;
            this.gameJS = gameJS;
            this.gameJS.onPlayLighting(true);
            this.bossIndex = this.gameJS.gotoGameData.chapterId;
            this.createBoss();
            this.gameJS.Bosslayer.addChild(this.bossNode);
            this.bossJS.onInit(this);
            this.bossData = gameJS.getCurLevelData().boss;
            this.data = this.bossData.attackState;
            this.speed = this.bossData.attackSpeed;
        }
        this.isCreateOver = false;
        this.bossNode.active = true;
        //播放背景音乐
        window.GameAudioJS().onPlayBossBG();
        this.playAnimation();
        this.gameJS.EnergyProgressBar.active = true;
        this.energyProgressBar = this.gameJS.EnergyProgressBar.getComponent(cc.ProgressBar);
        this.energyProgressBar.progress = 0;
        //当前分数
        this.onUpdatePoolData();
    },

    //创建boss
    createBoss() {
        if (this.bossIndex == 0) {
            this.bossNode = cc.instantiate(this.Bosses[0]);
            this.bossJS = this.bossNode.getComponent("crabBoss");
        } else if (this.bossIndex == 1) {
            this.bossNode = cc.instantiate(this.Bosses[1]);
            this.bossJS = this.bossNode.getComponent("airplaneBoss");
        } else if (this.bossIndex == 2) {
            this.bossNode = cc.instantiate(this.Bosses[2]);
            this.bossJS = this.bossNode.getComponent("catBoss");
        }
    },

    playAnimation() {
        if (this.isFristInit) {
            //第一次boss出现  sectionId=3
            const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == -1 && a.sectionId == 3);
            if (!progressData) {
                //第一次过后 往数据库插入一条数据作为标记 后续不在显示引导窗口
                this.gameJS.onRequestSetUserPorgress(-1, 3, 1);
                this.bossJS.playEnter();
                setTimeout(() => {
                    this.gameJS.onNoviceGuidePop(5, undefined, false, () => {
                        this.bossJS.playAnimation(false, 1 - this.onGetBloodRatio());
                        return;
                    });
                }, 2000);
            } else {
                this.bossJS.playAnimation(this.isFristInit, 1 - this.onGetBloodRatio());
            }
        } else {
            this.bossJS.playAnimation(this.isFristInit, 1 - this.onGetBloodRatio());
        }
        if (this.isFristInit) {
            this.isFristInit = false;
            const y = this.onGetBossDefaultY();
            this.bossNode.runAction(cc.moveTo(2, 0, y));
        }
    },

    //胜利
    onWin() {
        return this.bossJS.onWin();
    },

    //获取对应刷新池数据
    onUpdatePoolData() {
        this.unscheduleAllCallbacks(this);
        //当前已创建字母块索引
        this.letterRectIndex = 0;
        //当前字母块正常池
        this.curNormalLetterPool = this.data.normal;
        //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
        this.curUpdateCount = this.data.updateCount;
    },

    //用户重玩一次，复原boss位置等数据
    onRecover() {
        if (this.bossNode) {
            this.isFristInit = true;
            this.bossNode.active = false;
            this.gameJS.EnergyProgressBar.active = false;
            this.bossNode.y = 490;
        }
    },

    onGetBossDefaultY() {
        if (this.bossIndex == 0) {
            return 170;
        }
        else if (this.bossIndex == 1) {
            return 200;
        }
        else if (this.bossIndex == 2) {
            return 230;
        }
        return 200;
    },

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("letterRect");
        const target = curAnchorLetterJS.getFristLetter();
        const length = curAnchorLetterJS.removeCode(code);
        this.gameJS.onKeyDownRequestTrack(target, code, this.bossData);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.bulletSpeed = 50;
        return curAnchorLetterJS;
    },

    //根据剩余血量返回boss攻击状态进度比例
    onGetBloodRatio() {
        if (this.bossNode.residueBlood) {
            return (this.bossData.blood - this.bossNode.residueBlood) / this.bossData.blood;
        }
        return 0;
    },

    //失败了 停止游戏
    onLose() {
        this.onStop();
    },

    //获取随机数 取整
    randomToFloor(lower, upper) {
        return this.gameJS.randomToFloor(lower, upper);
    },
    //创建字母块
    createLetterItem(point) {
        if (this.isStop || gameLocalData.IsPause) return;
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
    onKeyError() {

    },

    onStop() {
        this.isStop = true;
        this.bossJS.onStop();
    },

    //打完一个字母
    finishOnce() {
        this.energyProgressBar.progress += 1 / this.curUpdateCount;
        //字母创建完成，检测字母是否都打击完毕
        if (!this.isCreateOver || !this.gameJS.getLettersAllFinish()) return;
        this.onStop();
        setTimeout(() => {
            this.gameJS.onBack();
        }, 1000);
    },
});

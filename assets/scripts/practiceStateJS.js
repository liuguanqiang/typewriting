//boss练习关卡 操作类
var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        //播放背景音乐
        window.GameAudioJS().onPlayExerciseBG();
        this.bossData = gameJS.getCurLevelData().boss;
        this.data = this.bossData.practiceState;
        this.speed = this.bossData.practiceSpeed;
        this.keyboardJS = gameJS.KeyboardJS;
        //当前刷新池索引
        this.curPoolIndex = 0;
        this.onUpdatePoolData();
        this.isCreateOver = false;
        this.unscheduleAllCallbacks(this);
        this.schedule(this.createLetterItem, 1.2, cc.macro.REPEAT_FOREVER, 0.1);

        this.gameJS.onRunTimer(true);
        //当前打正确的个数
        this.gameJS.hitOKCount = 0;
        //当前打错误的个数
        this.gameJS.hitErrorCount = 0;

        //第一次进入挑战关卡  sectionId=2
        const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == -1 && a.sectionId == 2);
        if (!progressData) {
            //第一次过后 往数据库插入一条数据作为标记 后续不在显示引导窗口
            this.gameJS.onRequestSetUserPorgress(-1, 2, 1);
            setTimeout(() => {
                this.gameJS.onNoviceGuidePop(4);
            }, 400);
        }
    },

    //获取对应刷新池数据
    onUpdatePoolData(isFristUpdate = true) {
        if (this.curPoolIndex < this.data.length) {
            //当前已创建字母块索引
            this.letterRectIndex = 0;
            //当前字母块正常池
            this.curNormalLetterPool = this.data[this.curPoolIndex].normal;
            //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
            this.curUpdateCount = this.data[this.curPoolIndex].updateCount;
            if (!isFristUpdate) {
                this.createLetterItem();
            }
        } else {
            //当前练习完成 
            this.levelFinish = true;
        }
    },

    //boss练习关卡总刷新次数
    onGetSumUpdateCount() {
        let count = 0;
        for (let i = 0; i < this.data.length; i++) {
            const item = this.data[i];
            count += item.updateCount;
        }
        return { sumCount: count, curStateData: this.bossData };
    },

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("letterRect");
        const target = curAnchorLetterJS.getFristLetter();
        const length = curAnchorLetterJS.removeCode(code);
        this.gameJS.onKeyDownRequestTrack(target, code, this.bossData);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.bulletSpeed = 60;
        return curAnchorLetterJS;
    },


    //失败了 停止游戏
    onLose() {
        this.unscheduleAllCallbacks(this);
    },

    //创建字母块
    createLetterItem() {
        if (gameLocalData.IsPause) {
            return;
        }
        if (this.letterRectIndex < this.curUpdateCount) {
            const item = this.gameJS.createLetterItem();
            const letterText = this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
            const x = this.keyboardJS.getPointX(letterText);
            item.getComponent("letterRect").onInit(letterText, cc.v2(x, 368), this.speed);
            this.letterRectIndex++;
            this.gameJS.onAutoLocation();
            if (this.letterRectIndex == this.curUpdateCount && this.curPoolIndex == this.data.length - 1) {
                this.isCreateOver = true;
            }
        } else {
            ++this.curPoolIndex;
            this.onUpdatePoolData(false);
        }
    },

    //惩罚一次，当前刷新项+1
    onKeyError() {
        for (let i = 0; i < this.gameJS.LetterBoxs.children.length; i++) {
            const element = this.gameJS.LetterBoxs.children[i];
            element.getComponent("letterRect").onAccelerate();
        }
        // this.curUpdateCount++;
        // this.isCreateOver = false;
    },

    //打完一个字母
    finishOnce() {
        //字母创建完成，检测字母是否都打击完毕
        if (!this.isCreateOver || !this.gameJS.getLettersAllFinish()) return;
        this.unscheduleAllCallbacks(this);
        setTimeout(() => {
            window.GameAudioJS().onPlayBossAppear();
            this.gameJS.onBack();
        }, 1000);
    },
});

//boss练习关卡 操作类
require('gameWindowFun');
var gameLocalData = require('gameLocalData');
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS, progressIndex) {
        this.gameJS = gameJS;
        //播放背景音乐
        window.GameAudioJS().onPlayExerciseBG();
        this.data = gameJS.getCurLevelData().exercise;
        this.keyboardJS = gameJS.KeyboardJS;
        //当前刷新池索引
        this.curPoolIndex = 0;
        //练习关卡索引，练习关卡会配置多个 如果配置了视频  默认关卡索引-1
        this.levelIndex = progressIndex;
        this.levelCount = this.data.exerciseState.length;
        this.topY = 290;
        this.onUpdatePoolData();
    },

    //获取对应刷新池数据
    onUpdatePoolData(isFristUpdate = true) {
        this.curLevelData = this.data.exerciseState[this.levelIndex].state;
        if (this.curPoolIndex < this.curLevelData.length) {
            //当前已创建字母块索引
            this.letterRectIndex = 0;
            //当前字母块正常池
            this.curNormalLetterPool = this.curLevelData[this.curPoolIndex].normal;
            //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
            this.curUpdateCount = this.curLevelData[this.curPoolIndex].updateCount;
            if (isFristUpdate) {
                this.gameJS.onRunTimer(true);
                //当前打正确的个数
                this.gameJS.hitOKCount = 0;
                //当前打错误的个数
                this.gameJS.hitErrorCount = 0;
                //当前关卡是否创建完成
                this.isCurCreateOver = false;
                let index = 3;
                const h = 80;
                let canvasHeight = this.gameJS.BgAnimBox.height;
                this.schedule(function () {
                    let isAutoLocation = index == 3 ? true : false;
                    let item = this.createLetterItem((canvasHeight + h) / 2, isAutoLocation);
                    if (item) {
                        const y = this.topY - h * index;
                        item.runAction(cc.moveTo(0.2, item.x, y).easing(cc.easeIn(2)));
                    }
                    --index;
                }, 0.1, 3, 0);
            } else {
                this.createLetterItem(this.topY);
            }
        }
    },

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("letterRect");
        const length = curAnchorLetterJS.removeCode(code);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.bulletSpeed = 60;
        return curAnchorLetterJS;
    },

    //失败了 停止游戏
    onLose() {

    },

    //创建字母块
    createLetterItem(y, isAutoLocation = true) {
        if (this.letterRectIndex < this.curUpdateCount) {
            const item = this.gameJS.createLetterItem();
            const letterText = this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
            const x = this.keyboardJS.getPointX(letterText);
            item.getComponent("letterRect").onInit(letterText, cc.v2(x, y), -1);
            this.letterRectIndex++;
            if (isAutoLocation) {
                this.gameJS.onAutoLocation();
            }
            if (this.letterRectIndex == this.curUpdateCount && this.curPoolIndex == this.curLevelData.length - 1) {
                this.isCurCreateOver = true;
            }
            return item;
        } else {
            ++this.curPoolIndex;
            this.onUpdatePoolData(false);
        }
        return null;
    },

    //按错一次
    onKeyError() {

    },

    //打完一个字母
    finishOnce() {
        for (let i = 0; i < this.gameJS.LetterBoxs.children.length; i++) {
            const node = this.gameJS.LetterBoxs.children[i];
            node.runAction(cc.moveTo(0.1, node.x, node.y - 80).easing(cc.easeIn(1)));
        }
        if (!this.isCurCreateOver) {
            setTimeout(() => {
                this.createLetterItem(this.topY);
            }, 100);
            return;
        }

        //当前关卡 打击完毕
        if (this.gameJS.getLettersAllFinish()) {
            const accuracy = this.gameJS.hitOKCount / (this.gameJS.hitOKCount + this.gameJS.hitErrorCount);
            this.gameJS.onRunTimer(false);
            console.log("this.gameJS.hitTimeOffset ", this.gameJS.hitTimeOffset);
            console.log("this.accuracy ", accuracy);
            let starNum = 1;
            //三星 两星判断
            const curStateData = this.data.exerciseState[this.levelIndex];
            const isThreeAccuracy = accuracy >= curStateData.threeStars.accuracy;
            const isThreeHitTimeOffset = this.gameJS.hitTimeOffset <= curStateData.threeStars.time;
            if (isThreeAccuracy && isThreeHitTimeOffset) {
                starNum = 3;
            } else if (accuracy >= curStateData.twoStars) {
                starNum = 2;
            }
            this.gameJS.onUpdateProgressData(starNum, this.levelIndex);
            //当前关卡完成 需解锁下一个关卡
            this.gameJS.onUnlockNextLevel(this.levelIndex);
            //当前练习全部关卡完成 需解锁下一模块第一个关卡
            if (this.levelIndex == this.levelCount - 1) {
                this.gameJS.onUnlockNextModule();
            }
            this.gameJS.onWinPop(starNum, isThreeAccuracy, isThreeHitTimeOffset, curStateData, (id) => {
                if (id == 2) {
                    this.curPoolIndex = 0;
                    this.onUpdatePoolData();
                } else if (id == 3) {
                    this.levelIndex++;
                    if (this.levelIndex < this.levelCount) {
                        const nextData = this.data.exerciseState[this.levelIndex];
                        if (nextData.isVideo) {
                            this.gameJS.onGotoVideo(this.levelIndex);
                        } else {
                            this.curPoolIndex = 0;
                            this.onUpdatePoolData();
                        }
                    } else {
                        this.gameJS.onBack();
                    }
                }
            });
        }
    },
});

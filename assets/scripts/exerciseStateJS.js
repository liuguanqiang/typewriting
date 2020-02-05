//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS, progressIndex) {
        this.gameJS = gameJS;
        this.data = gameJS.getCurLevelData().exercise;
        this.keyboardJS = gameJS.KeyboardJS;
        //当前刷新池索引
        this.curPoolIndex = 0;
        //练习关卡索引，练习关卡会配置多个
        this.levelIndex = progressIndex;
        this.levelCount = this.data.exerciseState.length;
        this.topY = 290;
        this.timeOffset = 0;
        this.timeCB = () => {
            this.timeOffset += 0.5;
        };
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
                this.timeOffset = 0;
                this.schedule(this.timeCB, 0.5);//启动定时器
                //当前打正确的个数
                this.correctCount = 0;
                //当前打错误的个数
                this.errorCount = 0;
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
        curAnchorLetterJS.bulletSpeed = 50;
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
        ++this.errorCount;
    },

    //打完一个字母
    finishOnce() {
        ++this.correctCount;
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
            const accuracy = this.correctCount / (this.correctCount + this.errorCount);
            this.unschedule(this.timeCB);
            console.log("this.timeOffset ", this.timeOffset);
            console.log("this.accuracy ", accuracy);
            let starNum = 1;
            //三星 两星判断
            if (accuracy >= this.data.threeStars.accuracy && this.timeOffset <= this.data.threeStars.time) {
                starNum = 3;
            } else if (accuracy >= this.data.twoStars) {
                starNum = 2;
            }
            this.gameJS.onWinPop(starNum, this.data, (id) => {
                if (id == 2) {
                    this.curPoolIndex = 0;
                    this.onUpdatePoolData();
                } else if (id == 3) {
                    this.levelIndex++;
                    if (this.levelIndex < this.levelCount) {
                        this.curPoolIndex = 0;
                        this.onUpdatePoolData();
                    } else {
                        this.gameJS.onBack();
                    }
                }
            });
        }
    },
});

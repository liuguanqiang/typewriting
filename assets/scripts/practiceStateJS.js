//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        this.data = gameJS.getCurLevelData().boss.practiceState;
        this.speed = gameJS.getCurLevelData().speed;
        this.letterBoxs = gameJS.LetterBoxs;
        this.letterRectItem = gameJS.LetterRectItem;
        this.bulletsBoxs = gameJS.BulletsBoxs;
        this.bulletItem = gameJS.BulletItem;
        this.audio = gameJS.Audio;
        this.keyboardJS = gameJS.KeyboardJS;
        this.scoreLabel = gameJS.Score.getComponent(cc.Label);
        this.curAnchorLetter = null;
        this.letterBoxs.destroyAllChildren();
        //当前分数
        this.score = 0;
        //当前刷新池索引
        this.curPoolIndex = 0;
        this.onUpdatePoolData();
    },

    //获取对应刷新池数据
    onUpdatePoolData() {
        this.unscheduleAllCallbacks(this);
        if (this.curPoolIndex < this.data.length) {
            //当前已创建字母块索引
            this.letterRectIndex = 0;
            //当前字母块正常池
            this.curNormalLetterPool = this.data[this.curPoolIndex].normal;
            //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
            this.curUpdateCount = this.data[this.curPoolIndex].updateCount;
            this.schedule(this.createLetterItem, 3, cc.macro.REPEAT_FOREVER, 0.1);
        } else {
            //当前练习完成
            console.log("当前练习完成");
        }
    },

    onKeyDown(event) {
        if (this.curAnchorLetter && !this.curAnchorLetter.isFinish) {
            const code = String.fromCharCode(event.keyCode).toLowerCase();
            const aLength = this.curAnchorLetter.getComponent("letterRect").removeCode(code);
            if (aLength == -1) {
                this.onKeyError();
                console.log("打错了");
                return;
            }
            const keyboardPoint = this.keyboardJS.onKeyDown(event, true);
            this.gameJS.createBulletItem(this.curAnchorLetter, keyboardPoint);
            if (aLength == 0) {
                this.curAnchorLetter.isFinish = true;
            }
        } else {
            this.onKeyError();
            console.log("打错无定位");
        }
    },

    //按错
    onKeyError() {
        if (!this.letterBoxs)
            return;
        for (let i = 0; i < this.letterBoxs.children.length; i++) {
            const element = this.letterBoxs.children[i];
            element.getComponent("letterRect").onAccelerate();
        }
        this.keyboardJS.onKeyDown(event, false);
        //惩罚一次，当前刷新项+1
        this.curUpdateCount++;
    },

    //创建字母块
    createLetterItem() {
        if (this.letterRectIndex < this.curUpdateCount) {
            const item = this.gameJS.createLetterItem();
            const letterText = this.curNormalLetterPool[this.randomToFloor(0, this.curNormalLetterPool.length)];
            const x = this.keyboardJS.getPointX(letterText);
            item.getComponent("letterRect").onInit(letterText, x, this.speed);
            console.log("isFinish1", item.isFinish)
            console.log("isFinish2", this.letterBoxs.children[0].isFinish)
            this.letterRectIndex++;
            this.onAutoLocation();
        } else {
            //当前池子已完成，刷新池子索引
            this.curPoolIndex++;
            this.onUpdatePoolData();
            return;
        }
    },

    //自动定位最近一个
    onAutoLocation() {
        if ((this.curAnchorLetter && !this.curAnchorLetter.isFinish) || !this.letterBoxs)
            return;
        for (let i = 0; i < this.letterBoxs.children.length; i++) {
            const element = this.letterBoxs.children[i];
            if (!element.isFinish) {
                this.curAnchorLetter = element;
                this.curAnchorLetter.getComponent("letterRect").setAnchor((node) => {
                    this.scoreLabel.string = ++this.score;
                    this.onAutoLocation();
                    this.gameJS.onletterNodePoolPut(node);
                });
                return;
            } else {
                console.log("element", element.isFinish)
                console.log("aa", this.letterBoxs.children.length)
            }
        }
    },

    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },
});

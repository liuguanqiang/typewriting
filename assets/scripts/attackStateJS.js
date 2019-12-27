//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,

    properties: {
        CrabBoss: cc.Prefab,
    },

    start() {
        this.isInit = false;

    },

    //开始游戏
    onPlayGame(gameJS) {
        this.gameJS = gameJS;
        if (!this.isInit) {
            this.isInit = true;
            this.bossNode = cc.instantiate(this.CrabBoss);
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.gameJS.Bosslayer.addChild(this.bossNode);
            this.initAnimation();
            this.data = gameJS.getCurLevelData().boss.attackState;
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
        this.unscheduleAllCallbacks(this);
        //当前已创建字母块索引
        this.letterRectIndex = 0;
        //当前字母块正常池
        this.curNormalLetterPool = this.data.normal;
        //当前正常池刷新次数，也就是用户不增加惩罚的默认刷新次数
        this.curUpdateCount = this.data.updateCount;
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
    createLetterItem(point) {
        if (this.letterRectIndex < this.curUpdateCount) {
            const item = this.gameJS.createLetterItem();
            const letterText = this.curNormalLetterPool[this.randomToFloor(0, this.curNormalLetterPool.length)];
            item.getComponent("letterRect").onInit(letterText, point, this.speed);
            this.letterRectIndex++;
            this.onAutoLocation();
        } else {
            //当前池子已完成，刷新池子索引
            return;
        }
    },

    //自动定位最近一个
    onAutoLocation() {
        if ((this.curAnchorLetter && !this.curAnchorLetter.isFinish) || !this.letterBoxs)
            return;
        for (let i = 0; i < this.letterBoxs.children.length; i++) {
            const item = this.letterBoxs.children[i];
            if (!item.isFinish) {
                this.curAnchorLetter = item;
                this.curAnchorLetter.getComponent("letterRect").setAnchor(() => {
                    this.curAnchorLetter.isFinish = true;
                    this.scoreLabel.string = ++this.score;
                    this.onAutoLocation();
                });
                return;
            }
        }
        if (this.levelFinish) {
            this.gameJS.onBack();
        }
    },

    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },
});

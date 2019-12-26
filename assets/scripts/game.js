cc.Class({
    extends: cc.Component,

    properties: {
        ConfigJson: cc.JsonAsset,
        LetterBoxs: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
        Audio: cc.Node,
        Keyboard: cc.Node
    },
    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    //954
    start() {
        //当前游戏状态  boss关卡 0 练习状态  1 boss攻击状态  2 boss挨打状态
        this.bossStateIndex = 0;
        this.KeyboardJS = this.Keyboard.getComponent("keyboard");
    },

    onPlayGame() {
        this.curAnchorLetter = null;
        this.LetterBoxs.destroyAllChildren();
        //当前关卡索引
        this.levelIndex = 0;
        //当前已创建字母块索引
        this.letterRectIndex = 0;
        //当前砖块速度
        this.speed = this.getCurLevelData().speed;
        //当前字母块列表
        this.letterRectList = this.getCurBossLetterData().normal;
        this.unscheduleAllCallbacks(this);
        this.schedule(this.createLetterItem, 2, cc.macro.REPEAT_FOREVER, 0.1);
    },

    onKeyDown(event) {
        const keyboardPoint = this.KeyboardJS.onKeyDown(event);
        const code = String.fromCharCode(event.keyCode).toLowerCase();
        if (!this.curAnchorLetter || this.curAnchorLetter.isFinish) {
            for (let i = 0; i < this.LetterBoxs.children.length; i++) {
                const item = this.LetterBoxs.children[i];
                if (item.isFinish) continue;
                if (item.getComponent("letterRect").getFristLetter() == code) {
                    this.curAnchorLetter = item;
                    this.curAnchorLetter.getComponent("letterRect").setAnchor();
                    break;
                }
            }
        }
        if (this.curAnchorLetter && !this.curAnchorLetter.isFinish) {
            const aLength = this.curAnchorLetter.getComponent("letterRect").removeCode(code);
            if (aLength == -1) {
                console.log("打错了");
                return;
            }
            const bullet = this.createBulletItem();
            bullet.getComponent("bullet").setTarget(this.curAnchorLetter, keyboardPoint);
            if (aLength == 0) {
                this.curAnchorLetter.isFinish = true;
            }
        } else {
            console.log("打错无定位");
        }
    },


    //创建字母块
    createLetterItem() {
        if (this.bossStateIndex == 0) {
            if (this.letterRectIndex < this.letterRectList.length) {
                const item = cc.instantiate(this.LetterRectItem);
                this.LetterBoxs.addChild(item);
                const letterText = this.letterRectList[this.letterRectIndex];
                const x = this.KeyboardJS.getPointX(letterText);
                item.getComponent("letterRect").onInit(this.letterRectList[this.letterRectIndex], x, this.speed);
                this.letterRectIndex++;
            } else {
                this.unscheduleAllCallbacks(this);
                return;
            }
        }

    },

    //创建子弹
    createBulletItem() {
        const item = cc.instantiate(this.BulletItem);
        this.BulletsBoxs.addChild(item);
        this.Audio.getComponent("gameAudio").onPlayBullet();
        return item;
    },

    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.ConfigJson.json.levels[this.levelIndex];
    },

    //获取当前关卡boos模式对应状态数据对象
    getCurBossLetterData() {
        if (this.bossStateIndex == 0) {
            return this.getCurLevelData().boss.practiceState;
        } else if (this.bossStateIndex == 1) {
            return this.getCurLevelData().boss.attackState;
        } else {
            return this.getCurLevelData().boss.beatingState;
        }
    },

    getCurWriting() {
        if (this.curIndex < this.dataJson.json.level1.length) {
            return this.dataJson.json.level1[this.curIndex];
        }
        return "";
    }
});

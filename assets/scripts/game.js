cc.Class({
    extends: cc.Component,

    properties: {
        ConfigJson: cc.JsonAsset,
        LetterBoxs: cc.Node,
        Bosslayer: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
        Audio: cc.Node,
        Keyboard: cc.Node,
        stateJSNode: cc.Node,
        Score: cc.Node,
        BgAnimBox: cc.Node,
        Pop: cc.Node,
        Lighting: cc.Node,
    },
    //954
    start() {
        //当前关卡索引
        this.levelIndex = 0;
        //当前游戏状态  boss关卡 0 练习状态  1 boss攻击状态  2 boss挨打状态
        this.bossStateIndex = 1;
        this.KeyboardJS = this.Keyboard.getComponent("keyboard");
        this.AudioJS = this.Audio.getComponent("gameAudio");
        this.AudioJS.onPlayBossStage1();
    },

    onLoad() {
        this.bulletNodePool = new cc.NodePool();
        for (let i = 0; i < 5; ++i) {
            let enemy = cc.instantiate(this.BulletItem);
            this.bulletNodePool.put(enemy);
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.onBgAnim();
    },
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onBgAnim() {
        const leftAnimBox = this.BgAnimBox.getChildByName("leftSprite");
        const rightAnimBox = this.BgAnimBox.getChildByName("rightSprite");
        for (let i = 0; i < leftAnimBox.children.length; i++) {
            const node = leftAnimBox.children[i];
            setTimeout(() => {
                node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(this.random(3, 6), node.x, -node.y), cc.moveTo(0, node.x, node.y))));
            }, i * 800);
        }
        for (let i = 0; i < rightAnimBox.children.length; i++) {
            const node = rightAnimBox.children[i];
            setTimeout(() => {
                node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(this.random(3, 6), node.x, -node.y), cc.moveTo(0, node.x, node.y))));
            }, i * 800);
        }
    },
    onPlayGame() {
        this.Pop.active = false;
        this.isLose = false;
        this.curAnchorLetter = null;
        this.BulletsBoxs.destroyAllChildren();
        this.LetterBoxs.destroyAllChildren();
        this.curStateJS = this.getStateJS();
        this.curStateJS.onPlayGame(this);
    },

    onBossGame() {
        if (this.curStateJS) {
            this.curStateJS.onLose();
        }
        this.bossStateIndex = 1;
        this.onPlayGame();
    },

    onBack(increment = 1) {
        this.bossStateIndex += increment;
        this.onPlayGame();
    },

    getStateJS() {
        this.Score.active = true;
        if (this.bossStateIndex == 0) {
            return this.stateJSNode.getComponent("practiceStateJS");
        } else if (this.bossStateIndex == 1) {
            return this.stateJSNode.getComponent("attackStateJS");
        } else {
            this.Score.active = false;
            return this.stateJSNode.getComponent("beatingStateJS");
        }
    },

    onKeyDown(event) {
        if (this.isLose) return;
        if (this.curAnchorLetter && !this.curAnchorLetter.isFinish) {
            const index = this.KeyboardJS.onCanKeyDown(event);
            if (index == -1) {
                return;
            }
            const code = String.fromCharCode(event.keyCode).toLowerCase();
            const aLength = this.curAnchorLetter.getComponent("letterRect").removeCode(code);
            if (aLength == -1) {
                this.onKeyError(index);
                console.log("打错了");
                return;
            }
            const keyboardPoint = this.KeyboardJS.onKeyDown(index, true);
            this.createBulletItem(this.curAnchorLetter, keyboardPoint);
        } else {
            // this.onKeyError();
            console.log("无定位");
        }
    },

    //按错
    onKeyError(index) {
        if (!this.LetterBoxs)
            return;
        this.AudioJS.onPlayKeyError();
        for (let i = 0; i < this.LetterBoxs.children.length; i++) {
            const element = this.LetterBoxs.children[i];
            element.getComponent("letterRect").onAccelerate();
        }
        this.KeyboardJS.onKeyDown(index, false);
        this.curStateJS.punishmentOnce();
    },


    //自动定位最近一个
    onAutoLocation() {
        if ((this.curAnchorLetter && !this.curAnchorLetter.isFinish) || !this.LetterBoxs)
            return;
        for (let i = 0; i < this.LetterBoxs.children.length; i++) {
            const item = this.LetterBoxs.children[i];
            if (!item.isFinish) {
                this.curAnchorLetter = item;
                this.curAnchorLetter.getComponent("letterRect").setAnchor(() => this.onFinishOnce(), () => this.onLose());
                return;
            }
        }
    },

    //字母块打击完成
    onFinishOnce() {
        this.curAnchorLetter.isFinish = true;
        this.curStateJS.finishOnce();
        this.onAutoLocation();
    },

    //游戏胜利
    onWin() {
        this.Pop.active = true;
        this.Pop.getChildByName('label').getComponent(cc.Label).string = "恭喜你 胜利了";
        this.AudioJS.onPlayWin();
        console.log("游戏胜利");
    },

    //触碰到键盘 失败了
    onLose() {
        this.isLose = true;
        this.Pop.active = true;
        this.Pop.getChildByName('label').getComponent(cc.Label).string = "哎呀 玩失败了";
        this.curStateJS.onLose();
        console.log("游戏失败了");
        this.AudioJS.onPlayLose();
        for (let index = 0; index < this.LetterBoxs.children.length; index++) {
            const element = this.LetterBoxs.children[index];
            element.getComponent("letterRect").onStop();
        }
    },

    //创建子弹
    createBulletItem(target, keyboardPoint) {
        let newNode;
        if (this.bulletNodePool.size() > 0) {
            newNode = this.bulletNodePool.get();
        } else {
            newNode = cc.instantiate(this.BulletItem);
        }
        this.BulletsBoxs.addChild(newNode);
        newNode.getComponent("bullet").setTarget(target, keyboardPoint, (node) => {
            this.bulletNodePool.put(node);
        });
        this.AudioJS.onPlayBullet();
        return newNode;
    },

    //创建字母块
    createLetterItem() {
        let newNode = cc.instantiate(this.LetterRectItem);
        this.LetterBoxs.addChild(newNode);
        return newNode;
    },

    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },

    //获取随机数
    random(lower, upper) {
        const random = Math.random() * (upper - lower) + lower;
        return random;
    },


    //获取当前字母框中的字母是否全部击打完成
    getLettersAllFinish() {
        if (this.LetterBoxs) {
            for (let index = 0; index < this.LetterBoxs.children.length; index++) {
                const element = this.LetterBoxs.children[index];
                if (!element.isFinish) {
                    return false;
                }
            }
        }
        return true;
    },

    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.ConfigJson.json.levels[this.levelIndex];
    },

    //闪烁光效
    onPlayLighting() {
        let action1 = cc.fadeTo(0.3, 255);
        action1.easing(cc.easeIn(1));

        let action2 = cc.fadeTo(0.3, 0);
        action2.easing(cc.easeOut(1));

        this.Lighting.runAction(cc.repeat(cc.sequence(action1, action2), 3));
    }
});

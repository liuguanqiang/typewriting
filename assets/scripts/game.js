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
        Score: cc.Node
    },
    //954
    start() {
        //当前关卡索引
        this.levelIndex = 0;

        //当前游戏状态  boss关卡 0 练习状态  1 boss攻击状态  2 boss挨打状态
        this.bossStateIndex = 1;
        this.KeyboardJS = this.Keyboard.getComponent("keyboard");
    },

    onLoad() {
        // this.bulletNodePool = new cc.NodePool();
        // for (let i = 0; i < 5; ++i) {
        //     let enemy = cc.instantiate(this.BulletItem);
        //     this.bulletNodePool.put(enemy);
        // }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    onPlayGame() {
        this.curStateJS = this.getStateJS();
        this.curStateJS.onPlayGame(this);
    },

    onBack() {
        if (this.bossStateIndex < 2) {
            this.bossStateIndex++;
            this.onPlayGame();
        }
    },

    getStateJS() {
        if (this.bossStateIndex == 0) {
            return this.stateJSNode.getComponent("practiceStateJS");
        } else if (this.bossStateIndex == 1) {
            return this.stateJSNode.getComponent("attackStateJS");
        } else {
            return this.stateJSNode.getComponent("practiceStateJS");
        }
    },

    onKeyDown(event) {
        this.curStateJS.onKeyDown(event);
        // if (!this.curAnchorLetter || this.curAnchorLetter.isFinish) {
        //     for (let i = 0; i < this.letterBoxs.children.length; i++) {
        //         const item = this.letterBoxs.children[i];
        //         if (item.isFinish) continue;
        //         if (item.getComponent("letterRect").getFristLetter() == code) {
        //             this.curAnchorLetter = item;
        //             break;
        //         }
        //     }
        // }
    },

    //创建子弹
    createBulletItem(target, keyboardPoint) {
        let newNode = cc.instantiate(this.BulletItem);
        // if (this.bulletNodePool.size() > 0) {
        //     newNode = this.bulletNodePool.get();
        // } else {
        //     newNode = cc.instantiate(this.BulletItem);
        // }
        this.BulletsBoxs.addChild(newNode);
        newNode.getComponent("bullet").setTarget(target, keyboardPoint);
        this.Audio.getComponent("gameAudio").onPlayBullet();
        return newNode;
    },

    //创建字母块
    createLetterItem() {
        let newNode = cc.instantiate(this.LetterRectItem);
        this.LetterBoxs.addChild(newNode);
        return newNode;
    },
    //字母块回收
    onletterNodePoolPut(node) {
        this.letterNodePool.put(node);
    },
    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.ConfigJson.json.levels[this.levelIndex];
    },
});

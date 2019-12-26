cc.Class({
    extends: cc.Component,

    properties: {
        ConfigJson: cc.JsonAsset,
        LetterBoxs: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
        Audio: cc.Node,
        Keyboard: cc.Node,
        stateJSNode: cc.Node
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
        //当前关卡索引
        this.levelIndex = 0;
        this.curStateJS = this.getStateJS();
        this.curStateJS.onSetData(this.getCurLevelData())
        this.curStateJS.onPlayGame(this);
    },
    getStateJS() {
        if (this.bossStateIndex == 0) {
            return this.stateJSNode.getComponent("practiceStateJS");
        } else if (this.bossStateIndex == 1) {
            return this.stateJSNode.getComponent("practiceStateJS");
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

    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.ConfigJson.json.levels[this.levelIndex];
    },
});

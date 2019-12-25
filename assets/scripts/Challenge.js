cc.Class({
    extends: cc.Component,

    properties: {
        ConfigJson: cc.JsonAsset,
        KeyJson: cc.JsonAsset,
        KeyItem: cc.Prefab,
        KeyBox: cc.Node,
        LetterBoxs: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
        Audio: cc.Node
    },
    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },
    //954
    start() {
        for (let i = 0; i < this.KeyJson.json.keys.length; i++) {
            const keyData = this.KeyJson.json.keys[i];
            const item = cc.instantiate(this.KeyItem);
            item.getComponent("keyCube").setKey(keyData);
            this.KeyBox.addChild(item);
        }
    },
    onKeyDown(event) {
        for (let i = 0; i < this.KeyBox.children.length; i++) {
            const item = this.KeyBox.children[i];
            if (item.getComponent("keyCube").keyCode == event.keyCode) {
                item.getComponent("keyCube").onClick();
                break;
            }
        }
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
            bullet.getComponent("bullet").setTarget(this.curAnchorLetter);
            if (aLength == 0) {
                this.curAnchorLetter.isFinish = true;
            }
        }else{
            console.log("打错无定位");
        }
    },
    onPlay() {
        this.curAnchorLetter = null;
        this.LetterBoxs.destroyAllChildren();
        this.letterIndex = 0;
        this.levelIndex = 0;
        this.letterDatas = this.ConfigJson.json.levels[this.levelIndex].boss.normal;
        this.unscheduleAllCallbacks(this);
        this.schedule(this.createLetterItem, 5, cc.macro.REPEAT_FOREVER, 0.1);
    },

    //创建字母块
    createLetterItem() {
        for (let i = 0; i < 4; i++) {
            if (this.letterIndex < this.letterDatas.length) {
                const item = cc.instantiate(this.LetterRectItem);
                this.LetterBoxs.addChild(item);
                item.getComponent("letterRect").onPlay(this.letterDatas[this.letterIndex], i * 1);
                this.letterIndex++;
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

    getCurWriting() {
        if (this.curIndex < this.dataJson.json.level1.length) {
            return this.dataJson.json.level1[this.curIndex];
        }
        return "";
    }
    // update (dt) {},
});

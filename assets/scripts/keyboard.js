cc.Class({
    extends: cc.Component,

    properties: {
        KeyBox: cc.Node,
        KeyJson: cc.JsonAsset,
        KeyItem: cc.Prefab,
        handImg: cc.Node,
        handFrames: [cc.SpriteFrame]
    },

    start() {
        this.backKeyCubeJS = null;
        for (let i = 0; i < this.KeyJson.json.keys.length; i++) {
            const keyData = this.KeyJson.json.keys[i];
            const item = cc.instantiate(this.KeyItem);
            item.getComponent("keyCube").setKey(keyData);
            this.KeyBox.addChild(item);
        }
    },

    onKeyDown(index, isCorrect, isKeyBgChange = true) {
        const item = this.KeyBox.children[index];
        const itemComponent = item.getComponent("keyCube");
        if (isKeyBgChange) {
            itemComponent.onClick(isCorrect);
        }
        //按键正确返回当前按键对应的世界坐标系
        if (isCorrect) {
            return item.convertToWorldSpaceAR(cc.v2(0, 0));
        }
        return 0;
    },

    onCanKeyDown(event) {
        for (let i = 0; i < this.KeyBox.children.length; i++) {
            const item = this.KeyBox.children[i];
            const itemComponent = item.getComponent("keyCube");
            if (itemComponent.keyCode == event.keyCode) {
                if (itemComponent.canClick) {
                    return { index: i, keyValue: itemComponent.keyValue };
                }
            }
        }
        return { index: -1 };
    },

    setHandImg(zm) {
        for (let i = 0; i < this.KeyBox.children.length; i++) {
            const itemJS = this.KeyBox.children[i].getComponent("keyCube");
            const keyTexts = itemJS.keyValue.split("\n");
            if (!keyTexts || keyTexts.length == 0) {
                continue;
            }
            const text = keyTexts[keyTexts.length - 1].toLowerCase();
            if (text == zm) {
                if (this.backKeyCubeJS) {
                    this.backKeyCubeJS.onSetActive(false);
                }
                this.backKeyCubeJS = itemJS;
                itemJS.onSetActive(true);
                this.showHandImg(itemJS.handIndex);
                return;
            }
        }
    },

    showHandImg(index) {
        if (index != undefined) {
            this.handImg.getComponent(cc.Sprite).spriteFrame = this.handFrames[index];
            this.handImg.setContentSize(820, 470);
        } else {
            //this.handImg.getComponent(cc.Sprite).spriteFrame = null;
        }
    },

    onHandOver() {
        if (this.backKeyCubeJS) {
            this.backKeyCubeJS.onSetActive(false);
        }
        this.handImg.getComponent(cc.Sprite).spriteFrame = null;
    },

    //获取字母对应键盘的X坐标点
    getPointX(letter) {
        let code = letter.substr(0, 1) == ";" ? 186 : letter.toUpperCase().charCodeAt(0);
        for (let i = 0; i < this.KeyBox.children.length; i++) {
            const item = this.KeyBox.children[i];
            if (item.getComponent("keyCube").keyCode == code) {
                return item.getPosition().x;
            }
        }
        return 0;
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        KeyBox: cc.Node,
        KeyJson: cc.JsonAsset,
        KeyItem: cc.Prefab,
    },

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
                //返回当前按键对应的世界坐标系
                return item.convertToWorldSpaceAR(cc.v2(0, 0));
            }
        }
        return 0;
    },

    //获取字母对应键盘的X坐标点
    getPointX(letter) {
        let code = letter == " " ? 32 : letter.toUpperCase().charCodeAt(0);
        for (let i = 0; i < this.KeyBox.children.length; i++) {
            const item = this.KeyBox.children[i];
            if (item.getComponent("keyCube").keyCode == code) {
                return item.getPosition().x;
            }
        }
        return 0;
    }
});

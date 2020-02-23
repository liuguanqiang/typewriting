
cc.Class({
    extends: cc.Component,

    properties: {
        KeyLabel: cc.Node,
        bg: cc.Node,
        keySpriteFrame: [cc.SpriteFrame]
    },
    start() {
    },

    setKey(keyData) {
        const label = this.KeyLabel.getComponent(cc.Label);
        label.string = keyData.key;
        this.keyValue = keyData.key;
        if (!keyData.code) {
            this.keyCode = keyData.key.charCodeAt();
        } else {
            this.keyCode = keyData.code;
        }

        if (keyData.fontSize) {
            label.fontSize = keyData.fontSize;
            label.lineHeight = keyData.fontSize + 8;
        }
        if (keyData.width) {
            this.KeyLabel.width = this.KeyLabel.width + (keyData.width - 1) * this.node.width;
            this.node.width = this.node.width * keyData.width;
            this.bg.width = this.node.width;
        }
        if (keyData.horizontal == 1) {
            label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            label.verticalAlign = cc.Label.VerticalAlign.BOTTOM;
        } else if (keyData.horizontal == 3) {
            label.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
            label.verticalAlign = cc.Label.VerticalAlign.BOTTOM;
        }
        this.canClick = keyData.active !== false;
    },
    onClick(isCorrect) {
        const index = isCorrect ? 0 : 1;
        this.bg.getComponent(cc.Sprite).spriteFrame = this.keySpriteFrame[index];
        this.bg.width = this.node.width;
        setTimeout(() => {
            this.bg.getComponent(cc.Sprite).spriteFrame = this.keySpriteFrame[2];
            this.bg.width = this.node.width;
        }, 130);
    }
});

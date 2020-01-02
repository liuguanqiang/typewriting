
cc.Class({
    extends: cc.Component,

    properties: {
        KeyLabel: cc.Node,
    },
    start() {
        this.blueColor = new cc.color(50, 149, 219, 255);
        this.redColor = new cc.color(242, 58, 58, 255);
    },

    setKey(keyData) {
        const label = this.KeyLabel.getComponent(cc.Label);
        label.string = keyData.key;
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
        }
        if (keyData.horizontal == 1) {
            label.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
            label.verticalAlign = cc.Label.VerticalAlign.BOTTOM;
        } else if (keyData.horizontal == 3) {
            label.horizontalAlign = cc.Label.HorizontalAlign.RIGHT;
            label.verticalAlign = cc.Label.VerticalAlign.BOTTOM;
        }
    },
    onClick(isCorrect) {
        this.node.color = isCorrect ? this.blueColor : this.redColor;
        this.KeyLabel.color = new cc.color(255, 255, 255, 255);
        setTimeout(() => {
            this.node.color = new cc.color(255, 255, 255, 255);
            this.KeyLabel.color = new cc.color(255, 255, 255, 25);
        }, 100);
    }
});

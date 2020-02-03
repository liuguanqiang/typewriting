cc.Class({
    extends: cc.Component,
    properties: {
        iconFrame: [cc.SpriteFrame],
        icon: cc.Node,
        title: cc.Node,
        starContent: cc.Node,
        play: cc.Node,
    },
    start() {

    },
    onInit(isVideo, data) {
        if (isVideo) {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[1];
        } else {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[0];
        }
        this.title.getComponent(cc.Label).string = data.name;
    }
})
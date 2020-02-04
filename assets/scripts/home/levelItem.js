var localData = require('localData');
cc.Class({
    extends: cc.Component,
    properties: {
        iconFrame: [cc.SpriteFrame],
        starFrame: cc.SpriteFrame,
        icon: cc.Node,
        title: cc.Node,
        starContent: cc.Node,
        play: cc.Node,
        shade: cc.Node,
        lock: cc.Node,
    },
    start() {

    },
    onInit(isVideo, gameData, index, data) {
        this.gameData = gameData;
        this.data = data;
        this.index = index;
        this.isVideo = isVideo;
        if (isVideo) {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[1];
            this.starContent.active = false;
        } else {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[0];
        }
        this.title.getComponent(cc.Label).string = data.name;
        this.onUnLock();
        //this.onLightenStar(2);
    },
    //解锁
    onUnLock() {
        this.shade.active = false;
        this.lock.active = false;
        this.play.active = true;
    },
    //设置亮起星星数量
    onLightenStar(num) {
        if (num > this.starContent.children.length) { return; }
        for (let i = 0; i < num; i++) {
            this.starContent.children[i].getComponent(cc.Sprite).spriteFrame = this.starFrame;
        }
    },
    onPlay() {
        if (!this.isVideo) {
            localData.GameData = this.gameData;
            localData.GameProgressIndex = this.index;
            cc.director.loadScene("gameScene");
        }
    }
})
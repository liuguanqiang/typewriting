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
    onInit(isVideo, index, data, cb) {
        this.data = data;
        this.sectionId = index;
        this.isVideo = isVideo;
        this.cb = cb;
        if (isVideo) {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[1];
            this.starContent.active = false;
        } else {
            this.icon.getComponent(cc.Sprite).spriteFrame = this.iconFrame[0];
        }
        this.title.getComponent(cc.Label).string = data.name;
    },

    //设置进度数据
    onSetProgressData(chapterId, progressData) {
        const data = progressData.find(a => a.chapterId == chapterId && a.sectionId == this.sectionId);
        if (data) {
            this.onUnLock();
            this.onLightenStar(data.score);
        }
    },

    //解锁
    onUnLock() {
        this.shade.active = false;
        this.lock.active = false;
        this.play.active = true;
    },

    //设置亮起星星数量
    onLightenStar(num) {
        if (num > this.starContent.children.length) {
            num = this.starContent.children.length;
        }
        for (let i = 0; i < num; i++) {
            this.starContent.children[i].getComponent(cc.Sprite).spriteFrame = this.starFrame;
        }
    },
    onPlay() {
        if (!this.isVideo) {
            this.cb();
        }
    }
})
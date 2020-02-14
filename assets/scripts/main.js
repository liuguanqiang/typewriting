var localData = require('localData');
cc.Class({
    extends: cc.Component,
    properties: {
        ScrollContent: cc.Node,
        GameItem: cc.Prefab,
        LevelJsons: [cc.JsonAsset],
        Audio: cc.Node,
        GameProgressData: cc.JsonAsset
    },

    start() {
        cc.director.preloadScene('gameScene');
    },
    onLoad() {
        this.AudioJS = this.Audio.getComponent("gameAudio");
        this.AudioJS.onPlayHomeBG();
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data = this.LevelJsons[i].json.level;
            const gameItem = cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(i, data, this.AudioJS);
        }
        if (!localData.GameProgressData) {
            localData.GameProgressData = this.GameProgressData.json.modules;
        }
        for (let i = 0; i < localData.GameProgressData.length; i++) {
            const data = localData.GameProgressData[i];
            if (this.ScrollContent.children.length > i) {
                const item = this.ScrollContent.children[i];
                item.getComponent("gameItem").onSetProgressData(data);
            }
        }
    }
});

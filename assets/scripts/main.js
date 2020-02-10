var localData = require('localData');
cc.Class({
    extends: cc.Component,
    properties: {
        ScrollContent: cc.Node,
        GameItem: cc.Prefab,
        LevelJsons: [cc.JsonAsset],
        GameProgressData: cc.JsonAsset
    },

    start() {
        cc.director.preloadScene('gameScene');
    },
    onLoad() {
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data = this.LevelJsons[i].json.level;
            const gameItem = cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(i, data);
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

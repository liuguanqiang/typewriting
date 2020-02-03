cc.Class({
    extends: cc.Component,

    properties: {
        ScrollContent: cc.Node,
        GameItem: cc.Prefab,
        LevelJsons: [cc.JsonAsset],
    },

    start() {

    },
    onLoad() {
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data =  this.LevelJsons[i].json.level;
            const gameItem=cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(data);
        }
    }
});

var localData = require('localData');
require('windowFun');
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
        window.PersistRootJS().initPersistRootNode();
        window.AudioJS().onPlayHomeBG();
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data = this.LevelJsons[i].json.level;
            const gameItem = cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(i, data);
        }

   
        let param = {
            "userId": 123456,
            "chapterId": 1,
            "sectionId": 1,
            "score": 30
        }
        window.UserJS().requestSetUserPorgress(() => {

        }, param);

        window.UserJS().requestGetUserList(() => {

        });


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

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

        window.UserJS().requestGetUserList((res) => {
            if (res.length == 0) {
                res = [{
                    "userId": 123123,
                    "chapterId": 0,
                    "sectionId": 0,
                    "score": 0
                }, {
                    "userId": 123123,
                    "chapterId": 0,
                    "sectionId": 1,
                    "score": 0
                }]
                res.forEach(param => {
                    window.UserJS().requestSetUserPorgress(() => { }, param);
                });
            }
            for (let i = 0; i < this.ScrollContent.children.length; i++) {
                const item = this.ScrollContent.children[i];
                item.getComponent("gameItem").onSetProgressData(res);
            }
        });
    }
});

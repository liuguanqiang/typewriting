var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {
        ScrollContent: cc.Node,
        GameItem: cc.Prefab,
        LevelJsons: [cc.JsonAsset],
        Audio: cc.Node,
        GameProgressData: cc.JsonAsset,
    },

    start() {
        cc.director.preloadScene('gameScene');
    },
    onLoad() {
        let userId = gameLocalData.UserID;
        if (!userId) {
            userId = this.randomToFloor(100000, 999999);
            gameLocalData.UserID = userId;
        }
        window.GamePersistRootJS().initPersistRootNode();
        window.GameAudioJS().onPlayHomeBG();
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data = this.LevelJsons[i].json.level;
            const gameItem = cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(i, data);
        }

        window.GameUserJS().requestGetUserList((res) => {
            if (res.length == 0) {
                res = [{
                    "userId": gameLocalData.UserID,
                    "chapterId": 0,
                    "sectionId": 0,
                    "score": 0
                }, {
                    "userId": gameLocalData.UserID,
                    "chapterId": 0,
                    "sectionId": 1,
                    "score": 0
                }]
                res.forEach(param => {
                    window.GameUserJS().requestSetUserPorgress(() => { }, param);
                });
            }
            for (let i = 0; i < this.ScrollContent.children.length; i++) {
                const item = this.ScrollContent.children[i];
                item.getComponent("gameItem").onSetProgressData(res);
            }
        },gameLocalData.UserID);
    },
    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },
    onGoHome() {
        // if (window.isShell) {
        //     this.AALab.getComponent(cc.Label).string = "AAAAAAAA";
        //     //return window.parent.HttpJS;
        // }
    }
});

var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {
        ScrollContent: cc.Node,
        GameItem: cc.Prefab,
        LevelJsons: [cc.JsonAsset],
        Audio: cc.Node,
        NoviceGuidePop: cc.Node,
        videoLayout: cc.Node,
        videoPlayer: cc.Node,
        userIDLab: cc.Node,
    },

    start() {
        cc.director.preloadScene('videoScene');
        cc.director.preloadScene('gameScene');
    },
    onLoad() {
        let userId = gameLocalData.UserId;
        if (!userId) {
            gameLocalData.UserId = 123123;
        }

        if (!gameLocalData.StratTime) {
            gameLocalData.StratTime = new Date().getTime();
            console.log(gameLocalData.StratTime);
        }
        this.userIDLab.getComponent(cc.Label).string = gameLocalData.UserId;
        window.GamePersistRootJS().initPersistRootNode();
        window.GameAudioJS().onPlayHomeBG();
        for (let i = 0; i < this.LevelJsons.length; i++) {
            const data = this.LevelJsons[i].json.level;
            const gameItem = cc.instantiate(this.GameItem);
            this.ScrollContent.addChild(gameItem);
            gameItem.getComponent("gameItem").onInit(i, data);
        }
        // window.GameUserJS().requestSetUserPorgress(() => { }, {
        //     "userId": gameLocalData.UserId,
        //     "chapterId": 2,
        //     "sectionId": 0,
        //     "score": 0
        // });
        window.GameUserJS().requestGetUserList(gameLocalData.UserId, (res) => {
            if (!res || res.length == 0) {
                res = [{
                    "userId": gameLocalData.UserId,
                    "chapterId": 0,
                    "sectionId": 0,
                    "score": 0
                }]
                res.forEach(param => {
                    window.GameUserJS().requestSetUserPorgress(() => { }, param);
                });
                this.onPlayVideo();
            }
            gameLocalData.GameProgressData = res;
            for (let i = 0; i < this.ScrollContent.children.length; i++) {
                const item = this.ScrollContent.children[i];
                item.getComponent("gameItem").onSetProgressData(res);
            }
        });
    },

    onPlayVideo() {
        setTimeout(() => {
            this.videoLayout.active = true;
            this.videoPlayer.on("meta-loaded", () => {
                this.videoPlayer.getComponent(cc.VideoPlayer).resume();
            })
            this.videoPlayer.on("completed", () => {
                this.videoLayout.active = false;
                this.NoviceGuidePop.active = true;
                const arrowDatas = [{ showArrowIndex: 1, x: 455 - this.node.width / 2, y: this.node.height / 2 - 222 }];
                this.NoviceGuidePop.getComponent("noviceGuidePop").onInit(0, arrowDatas);
            })
            this.videoPlayer.getComponent(cc.VideoPlayer).remoteURL = window.VideoUrl("movie.mp4");
        }, 1000);
    },
    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },
    onGoHome() {
        if (window.isShell) {
            const offTime = window.GetSecond(new Date().getTime() - gameLocalData.StratTime);
            window.requestContentTrack("learning_typing_pageExit", { duration: offTime });
            window.parent.PublicJS().runScene("MainScene");
        }
    },
});

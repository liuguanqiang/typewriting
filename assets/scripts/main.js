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
        shade: cc.Node,
    },

    start() {
        try {
            cc.director.preloadScene('videoScene');
            cc.director.preloadScene('gameScene');
        } catch (error) {
            window.requestContentTrack("learning_typing_error", { errorInfo: error.message });
        }
    },
    onLoad() {
        try {
            if (window.isShell) window.parent.ShellJS().eyeGuardStart();
            cc.renderer.canvas.focus()
            let userId = gameLocalData.UserId;
            if (!userId) {
                gameLocalData.UserId = 123123;
            }

            let musicVolum = gameLocalData.MusicVolum != undefined ? gameLocalData.MusicVolum : 1;
            cc.audioEngine.setMusicVolume(musicVolum);

            let soundVolum = gameLocalData.SoundVolum != undefined ? gameLocalData.SoundVolum : 1;
            cc.audioEngine.setEffectsVolume(soundVolum);

            if (!gameLocalData.StratTime) {
                gameLocalData.StratTime = new Date().getTime();
                this.shade.active = true;
            }
            window.GamePersistRootJS().initPersistRootNode();
            for (let i = 0; i < this.LevelJsons.length; i++) {
                const data = this.LevelJsons[i].json.level;
                const gameItem = cc.instantiate(this.GameItem);
                this.ScrollContent.addChild(gameItem);
                gameItem.getComponent("gameItem").onInit(i, data);
            }
            // window.GameUserJS().requestSetUserPorgress( {
            //     "userId": gameLocalData.UserId,
            //     "chapterId": 2,
            //     "sectionId": 0,
            //     "score": 0
            // },() => { });
            window.GameUserJS().requestGetUserList(gameLocalData.UserId, (res) => {
                if (!res || res.length == 0) {
                    res = [{
                        "userId": gameLocalData.UserId,
                        "chapterId": 0,
                        "sectionId": 0,
                        "score": 0
                    }]
                    res.forEach(param => {
                        window.GameUserJS().requestSetUserPorgress(param, () => { });
                    });
                    this.isOnPlayVideo = true;
                    this.onPlayVideo();
                }
                if (!this.isOnPlayVideo) {
                    window.GameAudioJS().onPlayHomeBG();
                    this.shade.active = false;
                }
                gameLocalData.GameProgressData = res;
                for (let i = 0; i < this.ScrollContent.children.length; i++) {
                    const item = this.ScrollContent.children[i];
                    item.getComponent("gameItem").onSetProgressData(res);
                }
            });
        } catch (error) {
            window.requestContentTrack("learning_typing_error", { errorInfo: error.message });
        }
    },

    onPlayVideo() {
        this.videoLayout.active = true;
        this.videoPlayer.on("meta-loaded", () => {
            this.videoPlayer.getComponent(cc.VideoPlayer).resume();
        })
        this.videoPlayer.on("completed", () => {
            this.videoLayout.active = false;
            this.shade.active = false;
            this.NoviceGuidePop.active = true;
            const arrowDatas = [{ showArrowIndex: 1, x: -57, y: 192 }];
            this.NoviceGuidePop.getComponent("noviceGuidePop").onInit(0, arrowDatas);
            window.GameAudioJS().onPlayHomeBG();
        })
        this.videoPlayer.getComponent(cc.VideoPlayer).remoteURL = window.VideoUrl("movie.mp4");
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
            gameLocalData.StratTime = null;
            window.parent.PublicJS().runScene("MainScene");
        }
    },
});

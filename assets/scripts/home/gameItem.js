var localData = require('localData');
require('windowFun');
cc.Class({
    extends: cc.Component,
    properties: {
        levelItem: cc.Prefab,
        title: cc.Node,
        levelContent: cc.Node,
        bossFrame: [cc.SpriteFrame],
        bossIcon: cc.Node,
        bossTitle: cc.Node,
        bossInfo: cc.Node,
        bossDiademaContent: cc.Node,
        bossPlayBtn: cc.Node,
        bossShade: cc.Node,
        bossLock: cc.Node,
        bossDiademaFrame: cc.SpriteFrame,
    },
    start() {

    },
    onInit(index, data) {
        this.gameData = data;
        this.moduleIndex = index;
        this.title.getComponent(cc.Label).string = data.name;
        let offset = 0;
        if (data.exercise.videoState) {
            offset = 1;
            const levelItem = cc.instantiate(this.levelItem);
            this.levelContent.addChild(levelItem);
            levelItem.getComponent("levelItem").onInit(true, data.exercise.videoState, () => {
                console.log("i ", 0)
            });
        }
        if (data.exercise.exerciseState) {
            for (let i = 0; i < data.exercise.exerciseState.length; i++) {
                const levelData = data.exercise.exerciseState[i];
                const levelItem = cc.instantiate(this.levelItem);
                this.levelContent.addChild(levelItem);
                levelItem.getComponent("levelItem").onInit(false, levelData, () => {
                    this.onPlayGame(i + offset);
                });
            }
        }
        this.bossIcon.getComponent(cc.Sprite).spriteFrame = this.bossFrame[index];
        this.bossTitle.getComponent(cc.Label).string = data.boss.name;
        this.bossInfo.getComponent(cc.Label).string = data.boss.describe;
    },

    //设置进度数据
    onSetProgressData(progressData) {
        this.progressData = progressData;
        for (let i = 0; i < progressData.levels.length; i++) {
            const levelData = progressData.levels[i];
            if (i < 3) {
                const item = this.levelContent.children[i];
                item.getComponent("levelItem").onSetProgressData(levelData);
            } else {
                this.onBossUnLock();
                this.onLightenDiadema(levelData.star);
            }
        }
        //如果进度数据已解锁的最后一个关卡获得星星数大于0，则自动解锁下一个关卡
        if (progressData.levels.length < 4) {
            const levelData = progressData.levels[progressData.levels.length - 1];
            if (levelData.star != 0) {
                const nextIndex = progressData.levels.length;
                if (nextIndex < 3) {
                    this.levelContent.children[nextIndex].getComponent("levelItem").onUnLock();
                } else {
                    this.onBossUnLock();
                }
            }
        }
    },

    //解锁
    onBossUnLock() {
        this.bossShade.active = false;
        this.bossLock.active = false;
        this.bossPlayBtn.active = true;
    },
    //设置亮起王冠数量
    onLightenDiadema(num) {
        if (num > this.bossDiademaContent.children.length) { return; }
        for (let i = 0; i < num; i++) {
            this.bossDiademaContent.children[i].getComponent(cc.Sprite).spriteFrame = this.bossDiademaFrame;
        }
    },
    onPlay() {
        this.onPlayGame(3);
    },
    onPlayGame(levelIndex) {
        window.AudioJS().onPlayBtn();
        localData.GameData = this.gameData;
        localData.GotoGameData = {
            moduleIndex: this.moduleIndex,
            levelIndex: levelIndex
        }
        cc.director.loadScene("gameScene");
    }
})
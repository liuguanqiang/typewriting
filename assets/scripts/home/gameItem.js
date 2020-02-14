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
        this.chapterId = index;
        this.title.getComponent(cc.Label).string = data.name;
        let offset = 0;
        if (data.exercise.videoState) {
            offset = 1;
            const levelItem = cc.instantiate(this.levelItem);
            this.levelContent.addChild(levelItem);
            levelItem.getComponent("levelItem").onInit(true, 0, data.exercise.videoState, () => {
                console.log("i ", 0)
            });
        }
        if (data.exercise.exerciseState) {
            for (let i = 0; i < data.exercise.exerciseState.length; i++) {
                const levelData = data.exercise.exerciseState[i];
                const levelItem = cc.instantiate(this.levelItem);
                this.levelContent.addChild(levelItem);
                levelItem.getComponent("levelItem").onInit(false, i + offset, levelData, () => {
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
        for (let i = 0; i < this.levelContent.children.length; i++) {
            const item = this.levelContent.children[i];
            item.getComponent("levelItem").onSetProgressData(this.chapterId, this.progressData);
        }
        const bossData = this.progressData.find(a => a.chapterId == this.chapterId && a.sectionId == 3);
        if (bossData) {
            this.onBossUnLock();
            this.onLightenDiadema(bossData.score);
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
        if (num > this.bossDiademaContent.children.length) {
            num = this.bossDiademaContent.children.length;
        }
        for (let i = 0; i < num; i++) {
            this.bossDiademaContent.children[i].getComponent(cc.Sprite).spriteFrame = this.bossDiademaFrame;
        }
    },
    onPlay() {
        this.onPlayGame(3);
    },
    onPlayGame(sectionId) {
        window.AudioJS().onPlayBtn();
        localData.GameData = this.gameData;
        localData.GotoGameData = {
            chapterId: this.chapterId,
            sectionId: sectionId
        }
        cc.director.loadScene("gameScene");
    }
})
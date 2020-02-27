var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {
        levelItem: cc.Prefab,
        title: cc.Node,
        levelContent: cc.Node,
        bossItem: cc.Node,
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
        if (data.exercise.exerciseState) {
            for (let i = 0; i < data.exercise.exerciseState.length; i++) {
                const levelData = data.exercise.exerciseState[i];
                const levelItem = cc.instantiate(this.levelItem);
                this.levelContent.addChild(levelItem);
                levelItem.getComponent("levelItem").onInit(i, levelData, (isVideo) => {
                    this.onPlayGame(i, isVideo);
                });
            }
        }
        this.bossIcon.getComponent(cc.Sprite).spriteFrame = this.bossFrame[index];
        const bossSize = [{ x: 132, y: 118 }, { x: 145, y: 115 }, { x: 145, y: 81 }];
        this.bossIcon.setContentSize(bossSize[index].x, bossSize[index].y);
        this.bossTitle.getComponent(cc.Label).string = data.boss.name;
        this.bossInfo.getComponent(cc.Label).string = data.boss.describe;
        const h = (data.exercise.exerciseState.length - 3) * 62;
        this.node.height += h;
        this.bossItem.height += h;
        this.bossShade.height += h;
        this.bossItem.y -= h / 2;
        this.bossIndex = data.exercise.exerciseState.length;
    },

    //设置进度数据
    onSetProgressData(progressData) {
        this.progressData = progressData;
        for (let i = 0; i < this.levelContent.children.length; i++) {
            const item = this.levelContent.children[i];
            item.getComponent("levelItem").onSetProgressData(this.chapterId, this.progressData);
        }
        const bossData = this.progressData.find(a => a.chapterId == this.chapterId && a.sectionId == this.bossIndex);
        this.scoreData = bossData;
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
        this.onPlayGame(this.bossIndex, false, true);
        const score = this.scoreData ? this.scoreData.score : 0;
        const isPass = score > 0;
        const data = {
            pass: isPass,
            scoreLevel: score,
            chapterId: this.gameData.boss.id,
            chapterName: this.gameData.boss.name,
            chapterType: "挑战"
        }
        window.requestContentTrack("learning_typing_chapterSelect", data);
    },
    onPlayGame(sectionId, isVideo, isBoss = false) {
        window.GameAudioJS().onPlayBtn();
        gameLocalData.GameData = this.gameData;
        gameLocalData.GotoGameData = {
            chapterId: this.chapterId,
            sectionId: sectionId,
            isBossLevel: isBoss
        }
        if (!isVideo) {
            cc.director.loadScene("gameScene");
        } else {
            cc.director.loadScene("videoScene");
        }
    }
})
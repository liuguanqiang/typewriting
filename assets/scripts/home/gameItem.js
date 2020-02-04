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
        this.data = data;
        this.title.getComponent(cc.Label).string = data.name;
        if (data.exercise.videoState) {
            const levelItem = cc.instantiate(this.levelItem);
            this.levelContent.addChild(levelItem);
            levelItem.getComponent("levelItem").onInit(true, data.exercise.videoState);
        }
        if (data.exercise.exerciseState) {
            for (let i = 0; i < data.exercise.exerciseState.length; i++) {
                const levelData = data.exercise.exerciseState[i];
                const levelItem = cc.instantiate(this.levelItem);
                this.levelContent.addChild(levelItem);
                levelItem.getComponent("levelItem").onInit(false, levelData);
            }
        }
        this.bossIcon.getComponent(cc.Sprite).spriteFrame = this.bossFrame[index];
        this.bossTitle = data.boss.name;
        this.bossInfo = data.boss.describe;
        this.onBossUnLock();
        //this.onLightenDiadema(2);
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
})
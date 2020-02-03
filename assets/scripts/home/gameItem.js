cc.Class({
    extends: cc.Component,
    properties: {
        levelItem: cc.Prefab,
        title: cc.Node,
        levelContent: cc.Node,
    },
    start() {

    },
    onInit(data) {
        this.title.getComponent(cc.Label).string = data.name;
        console.log(data)
        if (data.exercise.videoState) {
            const levelItem = cc.instantiate(this.levelItem);
            this.levelContent.addChild(levelItem);
            levelItem.getComponent("levelItem").onInit(true,data.exercise.videoState);
        }
        if (data.exercise.exerciseState) {
            for (let i = 0; i < data.exercise.exerciseState.length; i++) {
                const levelData = data.exercise.exerciseState[i];
                const levelItem = cc.instantiate(this.levelItem);
                this.levelContent.addChild(levelItem);
                levelItem.getComponent("levelItem").onInit(false, levelData);
            }
        }
    }
})
//飞机boss
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {

    },

    onInit() {
        //获取 ArmatureDisplay
        this._armatureDisPlay = this.getComponent(dragonBones.ArmatureDisplay)
        //获取 Armatrue
        this._armature = this._armatureDisPlay.armature();
    },

    playAnimation(name) {
        if (!this._armatureDisPlay) {
            this.onInit();
        }
        this._armatureDisPlay.playAnimation(name, 1);
    },
});

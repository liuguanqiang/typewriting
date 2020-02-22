//飞机boss
cc.Class({
    extends: cc.Component,
    properties: {

    },

    start() {

    },

    onInit(baseJS) {
        this.baseJS = baseJS;
        //获取 ArmatureDisplay
        this._armatureDisPlay = this.getComponent(dragonBones.ArmatureDisplay)
        //获取 Armatrue
        this._armature = this._armatureDisPlay.armature();
    },


    //如果用户第一次进入boss  用于引导显示
    playEnter() {
        this._armatureDisPlay.playAnimation('走', 0);
    },

    playAnimation(isFrist, bloodRatio) {
        this.stopAni = false;
        this.initAniIndex = 0;
        if (isFrist) {
            this.playEnter();
            setTimeout(() => {
                this.onAttackAnimation();
            }, 2200);
        } else {
            this.onAttackAnimation();
        }
    },
    //开始发射字符
    onAttackAnimation() {
        if (this.stopAni) return;
        const aniIndex = this.onGetAniIndex();
        if (aniIndex == 1) {
            this._armatureDisPlay.playAnimation('左手扔', 1);
            setTimeout(() => {
                this.baseJS.createLetterItem(cc.v2(-155, 170));
                this.onAttackAnimation();
            }, 500);
        } else if (aniIndex == 2) {
            this._armatureDisPlay.playAnimation('右手扔', 1);
            setTimeout(() => {
                this.baseJS.createLetterItem(cc.v2(155, 170));
                this.onAttackAnimation();
            }, 500);
        } else if (aniIndex == 3) {
            this._armatureDisPlay.playAnimation('呼吸', 0);
            setTimeout(() => {
                this.onAttackAnimation();
            }, 800);
        }
    },

    onGetAniIndex() {
        this.initAniIndex++;
        if (this.initAniIndex > 3) {
            this.initAniIndex = 1;
        }
        return this.initAniIndex;
    },

    onWin() {
        return 0;
    },
    onStop() {
        this._armatureDisPlay.playAnimation('呼吸', 1);
        this.stopAni = true;
    }
});

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
        this.isTwo = false;
    },

    //如果用户第一次进入boss  用于引导显示
    playEnter() {
        this._armatureDisPlay.playAnimation('走', 0);
    },

    playAnimation(isFrist, bloodRatio) {
        this.stopAni = false;
        this.state = bloodRatio > 0.5 ? 1 : 2;
        this.initAniIndex = 0;
        if (isFrist) {
            this.playEnter();
            setTimeout(() => {
                this.onAttackAnimation();
            }, 2200);
        } else {
            if (!this.isTwo && this.state == 2) {
                this.isTwo = true;
                this._armatureDisPlay.playAnimation('露弱点', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1300);
            } else {
                this.onAttackAnimation();
            }
        }
    },
    //开始发射字符
    onAttackAnimation() {
        if (this.stopAni) return;
        const aniIndex = this.onGetAniIndex();
        if (this.state == 1) {
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('左手扔', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(-115, 150));
                    this.onAttackAnimation();
                }, 500);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('右手扔', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(115, 150));
                    this.onAttackAnimation();
                }, 500);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('发怒', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1400);
            }
        } else {
            let count = 0;
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('露弱点左手扔', 1);
                this.schedule(function () {
                    // this.baseJS.createLetterItem(cc.v2(-155, 170));
                    this.baseJS.createLetterItem(cc.v2(-60 - count * 86, 150));
                    count++;
                    if (count == 2) {
                        this._armatureDisPlay.playAnimation('露弱点呼吸', 1);
                        setTimeout(() => {
                            this.onAttackAnimation();
                        }, 1400);
                    }
                }, 0.3, 1, 0.3);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('露弱点右手扔', 1);
                this.schedule(function () {
                    // this.baseJS.createLetterItem(cc.v2(-155, 170));
                    this.baseJS.createLetterItem(cc.v2(60 + count * 86, 150));
                    count++;
                    if (count == 2) {
                        this.onAttackAnimation();
                    }
                }, 0.3, 1, 0.3);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('发怒', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1400);
            }
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
        this._armatureDisPlay.playAnimation('死亡', 1);
        return 1500;
    },
    onStop() {
        this.stopAni = true;
        if (this.state === 1) {
            this._armatureDisPlay.playAnimation('呼吸', 1);
        } else {
            this._armatureDisPlay.playAnimation('露弱点呼吸', 1);
        }
    }
});

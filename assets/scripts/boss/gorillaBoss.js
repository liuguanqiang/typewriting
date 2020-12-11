//金刚boss
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
        this._armatureDisPlay.playAnimation('状态1待机', 0);
    },

    playAnimation(isFrist, bloodRatio) {
        this.stopAni = false;
        this.state = bloodRatio > 0.5 ? 1 : 2;
        this.initAniIndex = 0;
        if (isFrist) {
            this.playEnter();
            setTimeout(() => {
                this.onAttackAnimation();
            }, 2700);
        } else {
            if (!this.isTwo && this.state == 2) {
                this.isTwo = true;
                this._armatureDisPlay.playAnimation('暴怒变身', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1500);
            } else {
                this.onAttackAnimation();
            }
        }
    },
     //开始发射字符
     onAttackAnimation() {
        if (this.stopAni) return;
        if (this.baseJS.isCreateOver) {
            this.onBreathing(0);
            return;
        }
        const aniIndex = this.onGetAniIndex();
        if (this.state == 1) {
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('状态1左攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(-115, 170));
                    this.onAttackAnimation();
                }, 500);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('状态1右攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(115, 170));
                    this.onAttackAnimation();
                }, 500);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('状态1生气', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1000);
            }
        } else {
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('状态2左攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(-90, 160));
                    this.baseJS.createLetterItem(cc.v2(-180, 180));
                    this.baseJS.createLetterItem(cc.v2(-270, 200));
                    this._armatureDisPlay.playAnimation('状态2生气', 1);
                    setTimeout(() => {
                        this.onAttackAnimation();
                    }, 1200);
                }, 500);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('状态2右攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(90, 160));
                    this.baseJS.createLetterItem(cc.v2(180, 180));
                    this.baseJS.createLetterItem(cc.v2(270, 200));
                    this.onAttackAnimation();
                }, 500);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('状态2生气', 1);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1200);
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

    onBreathing(num) {
        if (this.state === 1) {
            this._armatureDisPlay.playAnimation('状态1待机', num);
        } else {
            this._armatureDisPlay.playAnimation('状态2待机', num);
        }
    },

    onWin() {
        this._armatureDisPlay.playAnimation('死亡', 1);
        return 1500;
    },
    onStop() {
        this.stopAni = true;
        this.onBreathing(1);
    }
});

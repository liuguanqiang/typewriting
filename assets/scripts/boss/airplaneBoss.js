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
        //添加动画监听
        //this._armatureDisPlay.addEventListener(dragonBones.EventObject.COMPLETE, this.animationEventHandler, this)
        // this._armatureDisPlay.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, this.animationEventHandler, this)
    },
    animationEventHandler: function animationEventHandler(event) {
        if (event.type == dragonBones.EventObject.COMPLETE) {
            //cc.log("完成");
        }
    },

    //如果用户第一次进入boss  用于引导显示
    playEnter() {
        this._armatureDisPlay.playAnimation('喷火焰进入', 0);
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
                this._armatureDisPlay.playAnimation('状态2变身', 1);
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
        const aniIndex = this.onGetAniIndex();
        if (this.state === 1) {
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('状态1左攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(-148, 105));
                    this.onAttackAnimation();
                }, 300);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('状态1右攻击', 1);
                setTimeout(() => {
                    this.baseJS.createLetterItem(cc.v2(148, 105));
                    this.onAttackAnimation();
                }, 300);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('生气', 0);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 1500);
            }
        } else {
            let count = 0;
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('状态2左攻击', 1);
                this.schedule(function () {
                    this.baseJS.createLetterItem(cc.v2(-108 - count * 86, 105));
                    count++;
                    if (count == 3) {
                        this._armatureDisPlay.playAnimation('状态2待机', 0);
                        setTimeout(() => {
                            this.onAttackAnimation();
                        }, 2000);
                    }
                }, 0.3, 2, 0.3);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('状态2右攻击', 1);
                this.schedule(function () {
                    this.baseJS.createLetterItem(cc.v2(108 + count * 86, 105));
                    count++;
                    if (count == 3) {
                        this.onAttackAnimation();
                        // this._armatureDisPlay.playAnimation('状态2待机', 0);
                        // setTimeout(() => {
                        //     this.onAttackAnimation();
                        // }, 500);
                    }
                }, 0.3, 2, 0.3);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('状态2生气', 0);
                setTimeout(() => {
                    this.onAttackAnimation();
                }, 2500);
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
            this._armatureDisPlay.playAnimation('状态1待机', 1);
        } else {
            this._armatureDisPlay.playAnimation('状态2待机', 1);
        }
    }
});

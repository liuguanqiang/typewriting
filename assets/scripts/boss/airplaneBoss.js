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
        this._armature = this._armatureDisPlay.armature()
        //添加动画监听
        //this._armatureDisPlay.addEventListener(dragonBones.EventObject.COMPLETE, this.animationEventHandler, this)
        // this._armatureDisPlay.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, this.animationEventHandler, this)
    },
    animationEventHandler: function animationEventHandler(event) {
        if (event.type == dragonBones.EventObject.COMPLETE) {
            //cc.log("完成");
        }
    },
    playAnimation(isFrist) {
        this.stopAni = false;
        this.state = 2;
        this.initAniIndex = 0;
        if (isFrist) {
            this._armatureDisPlay.playAnimation('喷火焰进入', 0);
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
                }, 600);
            }
        } else {
            let count = 0;
            if (aniIndex == 1) {
                this._armatureDisPlay.playAnimation('状态2左攻击', 1);
                this.schedule(function () {
                    this.baseJS.createLetterItem(cc.v2(-88 - count * 60, 105));
                    count++;
                    if (count == 3) {
                        this._armatureDisPlay.playAnimation('状态2待机', 0);
                        setTimeout(() => {
                            this.onAttackAnimation();
                        }, 1000);
                    }
                }, 0.2, 2, 0.2);
            } else if (aniIndex == 2) {
                this._armatureDisPlay.playAnimation('状态2右攻击', 1);
                this.schedule(function () {
                    this.baseJS.createLetterItem(cc.v2(88 + count * 60, 105));
                    count++;
                    if (count == 3) {
                        this._armatureDisPlay.playAnimation('状态2待机', 0);
                        setTimeout(() => {
                            this.onAttackAnimation();
                        }, 1000);
                    }
                }, 0.2, 2, 0.2);
            } else if (aniIndex == 3) {
                this._armatureDisPlay.playAnimation('状态2待机', 0);
                this.schedule(function () {
                    this.baseJS.createLetterItem(cc.v2(-88 - count * 60, 105));
                    this.baseJS.createLetterItem(cc.v2(88 + count * 60, 105));
                    count++;
                    if (count == 3) {
                        this._armatureDisPlay.playAnimation('状态2待机', 0);
                        setTimeout(() => {
                            this.onAttackAnimation();
                        }, 3000);
                    }
                }, 0.2, 2, 0.2);
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
    onStop() {
        this.stopAni = true;
    }
});

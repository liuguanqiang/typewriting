//boss练习关卡 操作类
cc.Class({
    extends: cc.Component,

    properties: {
        Blood: cc.Node,
        HaemalCountLabel: cc.Node,
        whiltBar: cc.Node,
        WeaknessLetterRect: cc.Prefab
    },

    start() {
        this.levelIndex = -1;
        this.interval = 250;//子弹发射间隔
    },

    //开始游戏
    onPlayGame(gameJS, levelIndex) {
        this.Blood.active = true;
        if (this.levelIndex != levelIndex) {
            this.gameJS = gameJS;
            this.levelIndex = levelIndex;
            this.bossNode = this.gameJS.Bosslayer.children[0];
            this.bossAnim = this.bossNode.getComponent(cc.Animation);
            this.data = gameJS.getCurLevelData().boss.beatingState;
            this.sumBlood = gameJS.getCurLevelData().boss.blood;
            this.residueBlood = this.sumBlood;
            this.HaemalCountLabel.getComponent(cc.Label).string = "X" + this.sumBlood / 10;
            this.energyProgressBar = this.gameJS.EnergyProgressBar.getComponent(cc.ProgressBar);
            this.y = this.bossNode.y + 33;
            this.particle = this.bossNode.getChildByName("particle");
            this.particle1 = this.bossNode.getChildByName("particle1");
        }
        this.onUpdatePoolData();
        this.onPlayAnimation();
    },


    //获取对应刷新池数据
    onUpdatePoolData() {
        this.unscheduleAllCallbacks(this);
        //当前字母块正常池
        this.curNormalLetterPool = this.data.normal;
        //当前打怪时间s
        this.curBeatTime = this.data.beatTime;
        //当前字母块个数
        this.updateCount = this.data.updateCount;
        this.isPlay = true;
        let tCount = 20;
        let t = 0;
        this.schedule(function () {
            ++t;
            this.energyProgressBar.progress -= 1 / tCount;
            if (t == tCount) {
                this.onSendBullet();
            }
        }, this.curBeatTime / tCount, tCount - 1, 0.1 * this.updateCount);
    },

    onKeyDown(code, curAnchorLetter) {
        const curAnchorLetterJS = curAnchorLetter.getComponent("weaknessLetterRect");
        const length = curAnchorLetterJS.removeCode(code);
        if (length == -1) {
            return null;
        }
        curAnchorLetterJS.launchBullet = false;
        return curAnchorLetterJS;
    },

    //失败了 停止游戏
    onLose() {
        this.isPlay = false;
        this.bossAnim.stop();
        clearTimeout(this.timeOut);
    },

    //开始播放boss动画 并发送字符
    onPlayAnimation() {
        let canvasWidth = this.gameJS.BgAnimBox.width;
        const rectWidth = 75;
        const left_x = -this.updateCount * rectWidth / 2;
        let index = 0;
        this.schedule(function () {
            const letterRect = cc.instantiate(this.WeaknessLetterRect);
            letterRect.index = index;
            this.gameJS.LetterBoxs.addChild(letterRect);
            letterRect.getComponent("weaknessLetterRect").onInit(cc.v2((canvasWidth + letterRect.width) / 2, 0), () => {
                this.finishOnce(letterRect.index);
            }, 0);
            letterRect.getComponent("weaknessLetterRect").onSetText(this.getLetterText());
            const x = left_x + index * rectWidth + rectWidth / 2;
            letterRect.runAction(cc.moveTo(0.2, x, letterRect.y - 30).easing(cc.easeIn(2)));
            if (index == 0) {
                letterRect.getComponent("weaknessLetterRect").onFlicker();
                this.gameJS.onSetAnchorLetter(letterRect);
            }
            ++index;
        }, 0.1, this.updateCount - 1, 0);
    },


    //获取一个随机字符
    getLetterText() {
        return this.curNormalLetterPool[this.gameJS.randomToFloor(0, this.curNormalLetterPool.length)];
    },

    //打错 惩罚直接返回攻击模式
    onKeyError() {
        this.onSendBullet();
    },

    //挨打模式时间到了  或者打错了  直接返回攻击模式
    gameOver(lastHighIndex) {
        setTimeout(() => {
            if (this.Blood.active) {
                this.Blood.active = false;
                this.gameJS.onBack(-1);
            }
        }, this.interval * lastHighIndex + 1000);
    },

    //打击完成 字符变成子弹发射
    onSendBullet() {
        this.gameJS.canKeyDown = false;
        this.unscheduleAllCallbacks(this);
        const tragetJS = this.onTragetJS();
        let lastHighIndex = 0;
        for (let i = 0; i < this.gameJS.LetterBoxs.children.length; i++) {
            const item = this.gameJS.LetterBoxs.children[i];
            if (item.isHigh) {
                lastHighIndex = i + 1;
                setTimeout(() => {
                    const keyboardPoint = item.convertToWorldSpaceAR(cc.v2(0, 0));
                    this.gameJS.createBulletItem(tragetJS, keyboardPoint);
                    this.onSetBlood(i);
                    item.destroy();
                }, this.interval * i);
            } else {
                item.destroy();
            }
        }
        if (lastHighIndex != 0) {
            this.createShockEff(lastHighIndex);
        }
        this.gameOver(lastHighIndex);
    },

    onTragetJS() {
        let isOne = true;
        let tragetJS = {};
        tragetJS.bulletSpeed = 30;
        tragetJS.getBullseyePosition = () => {
            return this.bossNode.getPosition();
        };
        tragetJS.setHit = () => {
            isOne = !isOne;
            if (isOne) {
                this.particle.getComponent(cc.ParticleSystem).resetSystem();
            } else {
                this.particle1.getComponent(cc.ParticleSystem).resetSystem();
            }
        };
        return tragetJS;
    },

    //抖动
    createShockEff(count) {
        let off = 2;
        const time = this.interval / 1000;
        const time_8 = time / 8;
        this.schedule(function () {
            off += 1;
            const action = cc.sequence(
                cc.moveBy(time_8, cc.v2(1 * off, 1 * off)),
                cc.moveBy(time_8, cc.v2(-1 * off, -1 * off)),
                cc.moveBy(time_8, cc.v2(-1 * off, 1 * off)),
                cc.moveBy(time_8, cc.v2(1 * off, -1 * off)),
                cc.moveBy(time_8, cc.v2(-1 * off, -1 * off)),
                cc.moveBy(time_8, cc.v2(1 * off, 1 * off)),
                cc.moveBy(time_8, cc.v2(1 * off, -1 * off)),
                cc.moveBy(time_8, cc.v2(-1 * off, 1 * off)),
            );
            this.bossNode.runAction(action.easing(cc.easeSineIn(5)));
        }, this.interval / 1000, count - 1, 0);
    },

    onSetBlood(increment) {
        this.residueBlood = (this.residueBlood - increment) > 0 ? (this.residueBlood - increment) : 0;
        if (this.residueBlood == 0) {
            this.Blood.getComponent(cc.ProgressBar).progress = 0;
            this.gameJS.onWin();
            return;
        }
        const xBlood = Math.ceil(this.residueBlood / 10);
        const yBlood = this.residueBlood % 10 == 0 ? 10 : this.residueBlood % 10;
        this.Blood.getComponent(cc.ProgressBar).progress = yBlood / 10;
        this.HaemalCountLabel.getComponent(cc.Label).string = "X" + xBlood;
    },

    //打完一个字母
    finishOnce(index) {
        const letterChildren = this.gameJS.LetterBoxs.children;
        if (index < letterChildren.length) {
            const letterRect = letterChildren[index];
            letterRect.getComponent("weaknessLetterRect").onSetHigh();
            if (index + 1 < letterChildren.length) {
                const nextLetter = letterChildren[index + 1];
                this.gameJS.onSetAnchorLetter(nextLetter);
                nextLetter.getComponent("weaknessLetterRect").onFlicker();
            } else {
                this.onSendBullet();
            }
        }
        //--this.residueBlood;
        // this.whiltBar.x = (1 - this.Blood.getComponent(cc.ProgressBar).progress) * this.Blood.width - this.Blood.width / 2;
        // this.whiltBar.runAction(cc.sequence(cc.fadeIn(0.4), cc.fadeOut(0.1)));
        // this.Blood.getComponent(cc.ProgressBar).progress -= 0.1;
        // if (this.residueBlood == 0) {
        //     this.gameJS.onWin();
        //     return;
        // }
        // if (this.Blood.getComponent(cc.ProgressBar).progress < 0.05) {
        //     this.Blood.getComponent(cc.ProgressBar).progress = 1;
        //     this.HaemalCountLabel.getComponent(cc.Label).string = "X" + Math.floor(this.residueBlood / 10);
        // }
        // this.letterRect.getComponent("weaknessLetterRect").onSetText(this.getLetterText());
    },
});

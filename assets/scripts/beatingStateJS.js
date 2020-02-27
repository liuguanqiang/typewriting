//boss练习关卡 操作类
require('gameWindowFun');
var gameLocalData = require('gameLocalData');
cc.Class({
    extends: cc.Component,

    properties: {
        Blood: cc.Node,
        WeaknessLetterRect: cc.Prefab,
        QTEStart: cc.Node,
        bossParticleLayer: cc.Node,
    },

    start() {
        this.interval = 300;//子弹发射间隔
    },

    //开始游戏
    onPlayGame(gameJS) {
        this.Blood.active = true;
        const id = gameJS.getCurLevelData().id;
        if (this.id != id) {
            this.gameJS = gameJS;
            this.id = id;
            this.bossNode = this.gameJS.Bosslayer.children[0];
            this.QTEStartAnim = this.QTEStart.getComponent(cc.Animation);
            this.bossData = gameJS.getCurLevelData().boss;
            this.data = this.bossData.beatingState;
            this.sumBlood = this.bossData.blood;
            this.bloodJS = this.Blood.getComponent("blood");
            this.bloodJS.onInit(this.sumBlood);
            this.energyProgressBar = this.gameJS.EnergyProgressBar.getComponent(cc.ProgressBar);
            this.y = this.bossNode.y + 33;
            this.particle = this.bossParticleLayer.getChildByName("particle");
            this.particle1 = this.bossParticleLayer.getChildByName("particle1");
        }
        window.GameAudioJS().onStopMusic();
        window.GameAudioJS().onPlayQTEAppear();
        setTimeout(() => {
            //播放背景音乐
            window.GameAudioJS().onPlayQTEBG();
            this.gameJS.onPlayLighting(false);
        }, 2000);
        this.isWin = false;
        this.onUpdatePoolData();
        this.onPlayAnimation();
        this.gameJS.checkGotoQTE(true);
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
        const delayTime = 0.1 * this.updateCount + 0.7;
        //第一次QTE出现  sectionId=4
        const sectionId = 4;
        const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == -1 && a.sectionId == sectionId);
        if (!progressData) {
            setTimeout(() => {
                //第一次过后 往数据库插入一条数据作为标记 后续不在显示引导窗口
                this.gameJS.onRequestSetUserPorgress(-1, sectionId, 1);
                this.gameJS.onNoviceGuidePop(6, undefined, false, () => {
                    this.onStartTime(0.1);
                });
            }, delayTime * 1000);
        } else {
            this.onStartTime(delayTime);
        }
    },

    //开始计时
    onStartTime(delayTime) {
        let tCount = 20;
        let t = 0;
        this.startTime = 0;
        this.schedule(function () {
            if (t == 0) {
                this.startTime = new Date().getTime();
            }
            ++t;
            this.energyProgressBar.progress -= 1 / tCount;
            if (t == tCount) {
                this.onSendBullet();
            }
        }, this.curBeatTime / tCount, tCount - 1, delayTime);

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

    //用户重玩一次，复原血量等数据
    onRecover() {
        if (this.bloodJS) {
            this.Blood.active = false;
            this.bloodJS.onInit(this.sumBlood);
            this.bossNode.residueBlood = this.sumBlood;
        }
    },

    //失败了 停止游戏
    onLose() {
        this.isPlay = false;
        clearTimeout(this.timeOut);
    },

    //开始播放boss动画 并发送字符
    onPlayAnimation() {
        this.QTEStartAnim.play();
        let canvasWidth = this.gameJS.BgAnimBox.width;
        const rectWidth = 75;
        const left_x = -this.updateCount * rectWidth / 2;
        let index = 0;
        this.schedule(function () {
            const letterRect = cc.instantiate(this.WeaknessLetterRect);
            letterRect.index = index;
            this.gameJS.LetterBoxs.addChild(letterRect);
            letterRect.getComponent("weaknessLetterRect").onInit(cc.v2((canvasWidth + letterRect.width) / 2, -90), () => {
                this.finishOnce(letterRect.index);
            }, 0);
            letterRect.getComponent("weaknessLetterRect").onSetText(this.getLetterText());
            const x = left_x + index * rectWidth + rectWidth / 2;
            letterRect.runAction(cc.moveTo(0.2, x, letterRect.y - 10).easing(cc.easeIn(2)));
            if (index == 0) {
                letterRect.getComponent("weaknessLetterRect").onFlicker();
                this.gameJS.onSetAnchorLetter(letterRect);
            }
            ++index;
        }, 0.1, this.updateCount - 1, 0.7);
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
    gameOver(highRectCount) {
        if (this.startTime != 0) {
            const duration = window.GetSecond(new Date().getTime() - this.startTime);
            const speed1 = highRectCount / duration;
            const data = {
                QTEDuration: duration,
                sumCount: this.updateCount,
                accuracy: highRectCount,
                speed: speed1,
                chapterId: this.bossData.id,
                chapterName: this.bossData.name,
                chapterType: "挑战"
            }
            window.requestContentTrack("learning_typing_ex_QTEAcct", data);
        }
        setTimeout(() => {
            if (this.isWin == true) {
                this.onWin();
                return;
            }
            if (this.Blood.active) {
                this.Blood.active = false;
                this.bloodJS.onReset();
                this.gameJS.onBack(-1);
                this.gameJS.checkGotoQTE(false);
            }
        }, this.interval * highRectCount + 1000);
    },

    //打击完成 字符变成子弹发射
    onSendBullet() {
        this.gameJS.canKeyDown = false;
        this.unscheduleAllCallbacks(this);
        const tragetJS = this.onTragetJS();
        let highRectCount = 0;
        for (let i = 0; i < this.gameJS.LetterBoxs.children.length; i++) {
            const item = this.gameJS.LetterBoxs.children[i];
            if (item.isHigh) {
                highRectCount = i + 1;
                setTimeout(() => {
                    const keyboardPoint = item.convertToWorldSpaceAR(cc.v2(0, 0));
                    window.GameAudioJS().onPlayBullet();
                    this.gameJS.createBulletItem(tragetJS, keyboardPoint);
                    this.onSetBlood(i + 1);
                    item.destroy();
                }, this.interval * i);
            } else {
                item.destroy();
            }
        }
        if (highRectCount != 0) {
            window.GameAudioJS().onPlayBossBG();
            this.createShockEff(highRectCount);
        }
        this.gameJS.onPlayLighting(false, false);
        this.gameOver(highRectCount);
    },

    onTragetJS() {
        let isOne = true;
        let tragetJS = {};
        tragetJS.bulletSpeed = 40;
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
        if (this.bossNode.residueBlood == 0)
            return;
        const residueBlood = this.bloodJS.onSetBlood(increment);
        this.bossNode.residueBlood = residueBlood;
        if (residueBlood == 0) {
            this.isWin = true;
        }
    },

    onWin() {
        const accuracy = this.gameJS.hitOKCount / (this.gameJS.hitOKCount + this.gameJS.hitErrorCount);
        this.gameJS.onRunTimer(false);
        console.log("this.gameJS.hitTimeOffset ", this.gameJS.hitTimeOffset);
        console.log("this.accuracy ", accuracy);
        let starNum = 1;
        //三星 两星判断
        const isThreeAccuracy = accuracy >= this.bossData.threeStars.accuracy;
        const isThreeHitTimeOffset = this.gameJS.hitTimeOffset <= this.bossData.threeStars.time;
        if (isThreeAccuracy && isThreeHitTimeOffset) {
            starNum = 3;
        } else if (accuracy >= this.bossData.twoStars) {
            starNum = 2;
        }
        const bossIndex = this.gameJS.getCurLevelData().exercise.exerciseState.length;
        this.gameJS.onUpdateProgressData(starNum, bossIndex);
        this.gameJS.onWinPop(starNum, isThreeAccuracy, isThreeHitTimeOffset, this.bossData, (id) => {
            if (id == 2) {
                this.gameJS.checkGotoQTE(false);
            }
        });
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
    },
});

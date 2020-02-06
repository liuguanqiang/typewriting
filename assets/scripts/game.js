var localData = require('localData');
cc.Class({
    extends: cc.Component,
    properties: {
        LetterBoxs: cc.Node,
        Bosslayer: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
        Audio: cc.Node,
        Keyboard: cc.Node,
        stateJSNode: cc.Node,
        BgAnimBox: cc.Node,
        Lighting: cc.Node,
        EnergyProgressBar: cc.Node,
        bg_left: [cc.Node],
        bg_right: [cc.Node],
        winPop: cc.Node,
        pausePop: cc.Node,
        failurePop: cc.Node,
    },
    //954
    start() {

    },

    onLoad() {
        this.initSetting();
        this.hitTimeCB = () => {
            this.hitTimeOffset += 0.5;
        };
        this.KeyboardJS = this.Keyboard.getComponent("keyboard");
        this.AudioJS = this.Audio.getComponent("gameAudio");
        //播放背景音乐
        this.AudioJS.onPlayBossStage1();
        //当前游戏总配置数据
        this.gameData = localData.GameData;
        //进入时游戏进度
        this.progressIndex = localData.GameProgressIndex;
        this.setAnchorCurStateIndex(this.progressIndex);
        //用户连续正确的次数  一旦错误归零重新累计
        this.correctCount = 0;
        this.bulletNodePool = new cc.NodePool();
        for (let i = 0; i < 10; ++i) {
            this.bulletNodePool.put(cc.instantiate(this.BulletItem));
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.onBgAnim();
        this.onPlayGame();
    },

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    //关卡切换重置数据
    initSetting() {
        this.hitOKCount = 0;
        this.hitErrorCount = 0;
        this.hitTimeOffset = 0;
    },

    //判断进入练习关卡还是boss关卡
    setAnchorCurStateIndex(index) {
        if (index < this.gameData.exercise.exerciseState.length) {
            this.curStateIndex = 0;
        } else {
            this.curStateIndex = 1;
        }
    },
    //背景上动画
    onBgAnim(isPlay = true) {
        const leftAnimBox = this.BgAnimBox.getChildByName("leftSprite");
        const rightAnimBox = this.BgAnimBox.getChildByName("rightSprite");
        const nodeAction = (i, node) => {
            if (isPlay) {
                setTimeout(() => {
                    node.runAction(cc.repeatForever(cc.sequence(cc.moveTo(this.random(3, 6), node.x, -node.y), cc.moveTo(0, node.x, node.y))));
                }, i * 800);
            } else {
                node.stopAllActions();
            }
        }
        for (let i = 0; i < leftAnimBox.children.length; i++) {
            const node = leftAnimBox.children[i];
            nodeAction(i, node);
        }
        for (let i = 0; i < rightAnimBox.children.length; i++) {
            const node = rightAnimBox.children[i];
            nodeAction(i, node);
        }
    },

    onPlayGame() {
        this.winPop.active = false;
        this.isLose = false;
        this.canKeyDown = true;
        this.curAnchorLetter = null;
        this.BulletsBoxs.destroyAllChildren();
        this.LetterBoxs.destroyAllChildren();
        this.curStateJS = this.getStateJS();
        this.curStateJS.onPlayGame(this, this.progressIndex);
    },

    onBack(increment = 1) {
        this.curStateIndex += increment;
        this.onPlayGame();
    },

    getStateJS() {
        if (this.curStateIndex == 0) {
            return this.stateJSNode.getComponent("exerciseStateJS");
        } else if (this.curStateIndex == 1) {
            return this.stateJSNode.getComponent("practiceStateJS");
        } else if (this.curStateIndex == 2) {
            return this.stateJSNode.getComponent("attackStateJS");
        } else {
            return this.stateJSNode.getComponent("beatingStateJS");
        }
    },

    onKeyDown(event) {
        if (event.keyCode == cc.macro.KEY.escape) {
            this.onPausePop();
            return;
        }
        if (this.isLose || !this.canKeyDown) return;
        if (this.curAnchorLetter && !this.curAnchorLetter.isFinish) {
            const index = this.KeyboardJS.onCanKeyDown(event);
            if (index == -1) {
                return;
            }
            const code = String.fromCharCode(event.keyCode).toLowerCase();
            const curAnchorLetterJS = this.curStateJS.onKeyDown(code, this.curAnchorLetter);
            if (!curAnchorLetterJS) {
                this.onKeyError(index);
                console.log("打错了");
                return;
            }
            ++this.correctCount;
            const keyboardPoint = this.KeyboardJS.onKeyDown(index, true);
            if (curAnchorLetterJS.launchBullet !== false) {
                this.createBulletItem(curAnchorLetterJS, keyboardPoint);
            }
        } else {
            console.log("无定位");
        }
    },

    //按错
    onKeyError(index) {
        this.correctCount = 0;
        if (!this.LetterBoxs)
            return;
        this.AudioJS.onPlayKeyError();
        this.KeyboardJS.onKeyDown(index, false);
        this.curStateJS.onKeyError();
        ++this.hitErrorCount;
    },

    //自动定位最近一个
    onAutoLocation() {
        if ((this.curAnchorLetter && !this.curAnchorLetter.isFinish) || !this.LetterBoxs)
            return;
        for (let i = 0; i < this.LetterBoxs.children.length; i++) {
            const item = this.LetterBoxs.children[i];
            if (!item.isFinish) {
                this.curAnchorLetter = item;
                this.curAnchorLetter.getComponent("letterRect").setAnchor(() => this.onFinishOnce(), () => this.onLose());
                return;
            }
        }
    },

    //设置定位字符快
    onSetAnchorLetter(item) {
        this.curAnchorLetter = item;
    },

    //一个字母块打击完成
    onFinishOnce() {
        this.curAnchorLetter.isFinish = true;
        this.curStateJS.finishOnce();
        ++this.hitOKCount;
        this.onAutoLocation();
    },

    //触碰到键盘 失败了
    onLose() {
        this.isLose = true;
        this.onFailurePop();
        this.curStateJS.onLose();
        this.AudioJS.onPlayLose();
        for (let index = 0; index < this.LetterBoxs.children.length; index++) {
            const element = this.LetterBoxs.children[index];
            element.getComponent("letterRect").onStop();
        }
    },

    //显示胜利弹窗
    onWinPop(num, data, cb) {
        setTimeout(() => {
            this.winPop.active = true;
            this.AudioJS.onPlayWin();
            const isBoss = this.curStateIndex != 0;
            this.winPop.getComponent("winPop").onInit(num, data, isBoss, (id) => {
                if (id == 1) {
                    cc.director.loadScene("mainScene");
                } else if (id == 2) {
                    cb(id);
                } else {
                    cb(id);
                }
                this.winPop.active = false;
            });
        }, 500);
    },
    //显示暂停窗口
    onPausePop() {
        cc.director.pause();//暂停
        this.pausePop.active = true;
        this.pausePop.getComponent("pausePop").onInit((id) => {
            this.pausePop.active = false;
            cc.director.resume();
            if (id == 1) {
                this.onBgAnim(false);
                cc.director.loadScene("mainScene");
            }
        })
    },

    //显示失败窗口
    onFailurePop() {
        this.failurePop.getComponent("failurePop").onDefault();
        this.failurePop.active = true;
        let progress = 0;
        if (this.curStateIndex == 1) {
            const sumCount = this.getStateJS().onGetSumUpdateCount();
            progress = (this.hitOKCount / sumCount / 2).toFixed(2);
            console.log("sumCount", sumCount);
            console.log("this.hitOKCount", sumCount);
            console.log("progress", progress);
        } else {
            progress = 0.5 + (this.getStateJS().onGetBloodRatio() / 2).toFixed(2);
        }
        this.failurePop.getComponent("failurePop").onInit(progress, (id) => {
            this.failurePop.active = false;
        })
    },

    //创建子弹
    createBulletItem(target, keyboardPoint) {
        let newNode;
        if (this.bulletNodePool.size() > 0) {
            newNode = this.bulletNodePool.get();
        } else {
            newNode = cc.instantiate(this.BulletItem);
        }
        this.BulletsBoxs.addChild(newNode);
        newNode.getComponent("bullet").onInit(target, keyboardPoint, this.onGetStall(), (node) => {
            this.bulletNodePool.put(node);
        });
        this.AudioJS.onPlayBullet();
        return newNode;
    },

    //获取粒子特效档位
    onGetStall() {
        let stallIndex = Math.ceil(this.correctCount / 2);
        if (stallIndex > 4) {
            stallIndex = 4;
        }
        if (stallIndex < 0) {
            stallIndex = 0;
        }
        return stallIndex;
    },

    //创建字母块
    createLetterItem() {
        let newNode = cc.instantiate(this.LetterRectItem);
        this.LetterBoxs.addChild(newNode);
        return newNode;
    },

    //获取随机数 取整
    randomToFloor(lower, upper) {
        const random = Math.floor(Math.random() * (upper - lower)) + lower;
        return random;
    },

    //获取随机数
    random(lower, upper) {
        const random = Math.random() * (upper - lower) + lower;
        return random;
    },


    //获取当前字母框中的字母是否全部击打完成
    getLettersAllFinish() {
        if (this.LetterBoxs) {
            for (let index = 0; index < this.LetterBoxs.children.length; index++) {
                const element = this.LetterBoxs.children[index];
                if (!element.isFinish) {
                    return false;
                }
            }
        }
        return true;
    },

    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.gameData;
    },

    //闪烁光效
    onPlayLighting() {
        let action1 = cc.fadeTo(0.3, 255);
        action1.easing(cc.easeIn(1));
        let action2 = cc.fadeTo(0.3, 0);
        action2.easing(cc.easeOut(1));
        this.Lighting.runAction(cc.repeat(cc.sequence(action1, action2), 6));
    },
    bgMove(bgList) {
        for (var index = 0; index < bgList.length; index++) {
            var element = bgList[index];
            element.y -= 1;
        }
    },
    //检查是否要重置位置
    checkBgReset(bgList) {
        var first_y = bgList[0].y;
        if (first_y <= -bgList[0].height) {
            var preFirstBg = bgList.shift();
            bgList.push(preFirstBg);
            var curFirstBg = bgList[0];
            preFirstBg.y = curFirstBg.height;
        }
    },

    //开启或者关闭计时器
    onRunTimer(isRun) {
        if (isRun) {
            this.initSetting();
            this.schedule(this.hitTimeCB, 0.5);//启动定时器
        } else {
            this.unschedule(this.hitTimeCB);
        }
    },

    update(dt) {
        this.bgMove(this.bg_left);
        this.checkBgReset(this.bg_left);
        this.bgMove(this.bg_right);
        this.checkBgReset(this.bg_right);
    }
});

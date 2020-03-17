var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {
        LetterBoxs: cc.Node,
        Bosslayer: cc.Node,
        BulletsBoxs: cc.Node,
        LetterRectItem: cc.Prefab,
        BulletItem: cc.Prefab,
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
        NoviceGuidePop: cc.Node,
        levelStartDragonBg: cc.Node,
        levelStartDragon: cc.Node,
    },
    //954
    start() {
    },

    onLoad() {
        this.bgSpeed = 1;
        gameLocalData.IsPause = false;
        this.initSetting();
        this.hitTimeCB = () => {
            //引导窗口显示时  不计入时间
            if (gameLocalData.IsPause) {
                return;
            }
            this.hitTimeOffset += 0.5;
        };
        this.KeyboardJS = this.Keyboard.getComponent("keyboard");

        //当前游戏总配置数据
        this.gameData = gameLocalData.GameData;

        //进入时游戏进度
        this.gotoGameData = gameLocalData.GotoGameData;
        this.setAnchorCurStateIndex(this.gotoGameData.isBossLevel);
        //用户连续正确的次数  一旦错误归零重新累计
        this.correctCount = 0;
        this.bulletNodePool = new cc.NodePool();
        for (let i = 0; i < 5; ++i) {
            this.bulletNodePool.put(cc.instantiate(this.BulletItem));
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        this.onBgAnim();
        this.onPlayGame();
        const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == 0 && a.sectionId == 1);
        if (!progressData || progressData.score == 0) {
            setTimeout(() => {
                this.onNoviceGuidePop(2);
            }, 1000);
        }
    },

    onDestroy() {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
    },

    //关卡切换重置数据
    initSetting() {
        //记录每个按键正确的个数
        this.hitOKCount = 0;
        this.hitErrorCount = 0;
        this.hitTimeOffset = 0;
        //记录爆炸了字符块个数
        this.hitOKRectCount = 0;
    },

    //判断进入练习关卡还是boss关卡
    setAnchorCurStateIndex(isBossLevel) {
        if (!isBossLevel) {
            this.curStateIndex = 0;
        } else {
            this.curStateIndex = 1;
        }
    },
    //背景上动画
    onBgAnim(isInit = true, isfast = true) {
        const leftAnimBox = this.BgAnimBox.getChildByName("leftSprite");
        const rightAnimBox = this.BgAnimBox.getChildByName("rightSprite");
        const nodeAction = (i, node) => {
            if (isInit) {
                setTimeout(() => {
                    if (!gameLocalData.IsPause) {
                        node.getComponent("smallRule").onPlay();
                    }
                }, i * 500);
            } else {
                node.getComponent("smallRule").onPlay(isfast);
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
        this.curStateJS.onPlayGame(this, this.gotoGameData.sectionId);
    },

    onBack(increment = 1) {
        this.curStateIndex += increment;
        this.onPlayGame();
    },

    checkGotoQTE(isQTE) {
        this.isQTE = isQTE;
        if (isQTE) {
            this.bgSpeed = 0.2;
            this.onBgAnim(false, false);
        } else {
            this.bgSpeed = 1;
            this.onBgAnim(false, true);
        }
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
        if (this.NoviceGuidePop.active) {
            return;
        }
        if (event.keyCode == cc.macro.KEY.escape) {
            this.onPausePop();
            return;
        }
        if (this.isLose || !this.canKeyDown) return;
        if (this.curAnchorLetter && !this.curAnchorLetter.isFinish) {
            const KeyData = this.KeyboardJS.onCanKeyDown(event);
            if (KeyData.index == -1) {
                return;
            }
            const keyValues = KeyData.keyValue.split("\n");
            if (!keyValues || keyValues.length == 0) {
                return;
            }
            const keyValue = keyValues[keyValues.length - 1].toLowerCase();
            const curAnchorLetterJS = this.curStateJS.onKeyDown(keyValue, this.curAnchorLetter);
            if (!curAnchorLetterJS) {
                this.onKeyError(KeyData.index);
                console.log("打错了");
                return;
            }
            ++this.correctCount;
            ++this.hitOKCount;
            const isKeyBgChange = this.curStateIndex != 0;
            const keyboardPoint = this.KeyboardJS.onKeyDown(KeyData.index, true, isKeyBgChange);
            this.setHandImg();
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
        window.GameAudioJS().onPlayKeyError();
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
                this.setHandImg();
                return;
            }
        }
    },

    //手势图判断
    setHandImg() {
        if (this.curStateIndex != 0) {
            return;
        }
        if (this.curAnchorLetter) {
            const zm = this.curAnchorLetter.getComponent("letterRect").getFristLetter();
            if (zm) {
                this.KeyboardJS.setHandImg(zm);
            }
        }
    },

    //设置定位字符快
    onSetAnchorLetter(item) {
        this.curAnchorLetter = item;
    },

    //一个字母块打击完成
    onFinishOnce() {
        ++this.hitOKRectCount;
        window.GameAudioJS().onPlayBullet();
        this.curAnchorLetter.isFinish = true;
        this.curStateJS.finishOnce();
        this.onAutoLocation();
    },

    //触碰到键盘 失败了
    onLose() {
        this.isLose = true;
        this.onRunTimer(false);
        this.onFailurePop();
        this.curStateJS.onLose();
        window.GameAudioJS().onPlayLose();
        for (let index = 0; index < this.LetterBoxs.children.length; index++) {
            const element = this.LetterBoxs.children[index];
            element.getComponent("letterRect").onStop();
        }
    },

    //boss关卡胜利或者失败  在玩一次
    onBossOnceAgain() {
        this.stateJSNode.getComponent("attackStateJS").onRecover();
        this.stateJSNode.getComponent("beatingStateJS").onRecover();
        this.curStateIndex = 1;
        this.onPlayGame();
    },

    //显示胜利弹窗
    onWinPop(num, isThreeAccuracy, isThreeHitTimeOffset, data, cb) {
        const isBoss = this.curStateIndex != 0;
        let delayDate = 500;
        if (isBoss) {
            delayDate += this.stateJSNode.getComponent("attackStateJS").onWin();
        }
        setTimeout(() => {
            this.winPop.active = true;
            this.Keyboard.active = false;
            this.canKeyDown = false;
            window.GameAudioJS().onPlayWin();
            this.winPop.getComponent("winPop").onInit(num, isThreeAccuracy, isThreeHitTimeOffset, data, isBoss, (id) => {
                window.GameAudioJS().onPlayBtn();
                if (id == 1) {
                    this.onBtnRequestTrack("learning_typing_ex_backToMenu", true, isBoss, num, data);
                    this.onGotoMainScene();
                } else if (id == 2) {
                    this.onBtnRequestTrack("learning_typing_ex_redo", true, isBoss, num, data);
                    if (isBoss) {
                        this.onBossOnceAgain();
                        cb(id);
                    } else {
                        cb(id);
                    }
                } else {
                    this.onBtnRequestTrack("learning_typing_ex_nextPass", true, isBoss, num, data);
                    cb(id);
                }
                this.winPop.active = false;
                this.Keyboard.active = true;
                this.canKeyDown = true;
            });
            this.onWinShowNovicePop(isBoss, num, data);
        }, delayDate);
    },

    //胜利窗口判断是否需要显示引导
    onWinShowNovicePop(isBoss, num, curStateData) {
        //第一次练习关卡胜利  sectionId=0  第一次boss关卡胜利sectionId=1
        const sectionId = isBoss ? 1 : 0;
        //第一次显示胜利窗口判断  后台数据中 chapterId=-1 
        const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == -1 && a.sectionId == sectionId);
        if (!progressData) {
            //第一次过后 往数据库插入一条数据作为标记 后续胜利不在显示引导窗口
            this.onRequestSetUserPorgress(-1, sectionId, 1);
            setTimeout(() => {
                if (!isBoss) {
                    const arrowDatas = [{ showArrowIndex: 2, x: 130, y: -211 }];
                    this.onNoviceGuidePop(3, arrowDatas, true);
                } else {
                    const arrowDatas = [{ showArrowIndex: 1, x: 42, y: -211 },
                    { showArrowIndex: 2, x: -128, y: -211 }];
                    this.onNoviceGuidePop(8, arrowDatas, true);
                }
            }, 2100 + num * 300);
        }
        this.onRequestContentTrack(true, progressData == undefined, isBoss, num, curStateData);
    },

    //显示失败窗口
    onFailurePop() {
        this.failurePop.getComponent("failurePop").onDefault();
        this.failurePop.active = true;
        this.Keyboard.active = false;
        this.canKeyDown = false;
        let progress = 0;
        if (this.curStateIndex == 1) {
            const sumCount = this.getStateJS().onGetSumUpdateCount().sumCount;
            progress = (this.hitOKRectCount / sumCount / 2);
            console.log("sumCount", sumCount);
            console.log("this.hitOKRectCount", sumCount);
            console.log("progress", progress);
        } else {
            progress = 0.5 + (this.getStateJS().onGetBloodRatio() / 2);
        }
        this.failurePop.getComponent("failurePop").onInit(progress, this.gotoGameData.chapterId, (id) => {
            window.GameAudioJS().onPlayBtn();
            if (id == 1) {
                this.onBtnRequestTrack("learning_typing_ex_backToMenu", false, true, 0, this.getCurLevelData().boss);
                this.onGotoMainScene();
            } else if (id == 2) {
                this.onBtnRequestTrack("learning_typing_ex_redo", false, true, 0, this.getCurLevelData().boss);
                this.onBossOnceAgain();
            }
            this.failurePop.active = false;
            this.Keyboard.active = true;
            this.canKeyDown = true;
        })
        //第一次失败出现  sectionId=5
        const sectionId = 5;
        const progressData = gameLocalData.GameProgressData.find(a => a.chapterId == -1 && a.sectionId == sectionId);
        if (!progressData) {
            //第一次过后 往数据库插入一条数据作为标记 后续胜利不在显示引导窗口
            this.onRequestSetUserPorgress(-1, sectionId, 1);
            setTimeout(() => {
                const arrowDatas = [{ showArrowIndex: 1, x: 72, y: -168 }];
                this.onNoviceGuidePop(7, arrowDatas, true);
            }, 1500);
        }
        this.onRequestContentTrack(false, progressData == undefined, true, 0, this.getCurLevelData().boss);
    },

    onRequestContentTrack(ispass, isfirstPass, isBoss, num, curStateData) {
        const chapterTime = parseInt(this.hitTimeOffset);
        const trackData = {
            pass: ispass,
            firstPass: isfirstPass,
            chapterDuration: chapterTime,
            scoreLevel: num,
            accuracy: this.hitOKCount / (this.hitOKCount + this.hitErrorCount),
            speed: this.hitOKCount / chapterTime * 60,
            characters: this.hitOKCount,
            chapterId: curStateData.id,
            chapterName: curStateData.name,
            chapterType: isBoss ? "挑战" : "练习"
        }
        window.requestContentTrack("learning_typing_ex_chapterAcct", trackData);
    },

    onBtnRequestTrack(eventName, ispass, isBoss, starNum, curStateData) {
        const trackData = {
            pass: ispass,
            scoreLevel: starNum,
            chapterId: curStateData.id,
            chapterName: curStateData.name,
            chapterType: isBoss ? "挑战" : "练习"
        }
        window.requestContentTrack(eventName, trackData);
    },

    onKeyDownRequestTrack(target1, keyin1, curStateData) {
        const trackData = {
            target: target1,
            keyin: keyin1,
            correct: target1 == keyin1,
            chapterId: curStateData.id,
            chapterName: curStateData.name,
            chapterType: this.curStateIndex == 0 ? "练习" : "挑战"
        }
        window.requestContentTrack("learning_typing_ex_keyDown", trackData);
    },

    //显示暂停窗口
    onPausePop() {
        if (!this.Keyboard.active)
            return;
        cc.director.pause();//暂停
        this.pausePop.active = true;
        gameLocalData.IsPause = true;
        this.canKeyDown = false;
        this.pausePop.getComponent("pausePop").onInit((id) => {
            this.pausePop.active = false;
            gameLocalData.IsPause = false;
            this.canKeyDown = true;
            cc.director.resume();
            window.GameAudioJS().onPlayBtn();
            let progress1 = 0;
            let curStateData = null;
            if (this.curStateIndex == 0) {
                const stateData = this.getStateJS().onGetSumUpdateCount();
                curStateData = stateData.curStateData;
                progress1 = this.hitOKRectCount / stateData.sumCount;
            } else if (this.curStateIndex == 1) {
                const stateData = this.getStateJS().onGetSumUpdateCount();
                curStateData = stateData.curStateData;
                progress1 = (this.hitOKRectCount / stateData.sumCount / 2);
            } else {
                curStateData = this.getCurLevelData().boss;
                progress1 = 0.5 + (this.getStateJS().onGetBloodRatio() / 2);
            }
            const trackData = {
                pauseChoice: id == 1 ? "退出" : "继续",
                progress: progress1 * 100 + "%",
                chapterId: curStateData.id,
                chapterName: curStateData.name,
                chapterType: this.curStateIndex == 0 ? "练习" : "挑战"
            }
            window.requestContentTrack("learning_typing_ex_pause", trackData);
            if (id == 1) {
                this.onGotoMainScene();
            }
        })
    },

    //显示新手引导窗口
    onNoviceGuidePop(index, arrowDatas, isTop, cb) {
        gameLocalData.IsPause = true;
        this.NoviceGuidePop.active = true;
        this.NoviceGuidePop.getComponent("noviceGuidePop").onInit(index, arrowDatas, isTop, () => {
            gameLocalData.IsPause = false;
            if (cb) {
                cb();
            }
        });
    },

    //用户胜利更新关卡进度信息
    onUpdateProgressData(starNum, sectionId) {
        this.onRequestSetUserPorgress(this.gotoGameData.chapterId, sectionId, starNum);
    },

    //解锁下一个关卡
    onUnlockNextLevel(sectionId) {
        this.onRequestSetUserPorgress(this.gotoGameData.chapterId, sectionId + 1, 0);
    },

    //解锁下一个模块第一个关卡
    onUnlockNextModule() {
        this.onRequestSetUserPorgress(this.gotoGameData.chapterId + 1, 0, 0);
    },

    onRequestSetUserPorgress(chapterId, sectionId, score) {
        const param = {
            "userId": gameLocalData.UserId,
            "chapterId": chapterId,
            "sectionId": sectionId,
            "score": score
        }
        gameLocalData.GameProgressData.push(param);
        window.GameUserJS().requestSetUserPorgress(param, () => { });
    },

    onGotoVideo(sectionId) {
        gameLocalData.GotoGameData.sectionId = sectionId;
        cc.director.loadScene("videoScene");
    },

    //返回主页
    onGotoMainScene() {
        gameLocalData.IsPause = true;
        this.onRunTimer(false);
        cc.director.loadScene("mainScene");
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

    //关卡先导动画
    onPlayLevelStartDragon(name, cb) {
        this.levelStartDragonBg.active = true;
        this.levelStartDragon.getComponent("levelStartDragon").playAnimation(name);
        setTimeout(() => {
            this.levelStartDragonBg.active = false;
            if (cb) {
                cb();
            }
        }, 3000);
    },

    ///获取当前关卡的数据对象
    getCurLevelData() {
        return this.gameData;
    },

    //闪烁光效
    onPlayLighting(isRed, isPlay = true) {
        if (!isPlay) {
            this.Lighting.stopAllActions();
            this.Lighting.opacity = 0;
            return;
        }
        this.Lighting.color = isRed ? new cc.color(255, 46, 97, 255) : new cc.color(220, 220, 220, 255);
        const time = isRed ? 0.3 : 0.5;
        let action1 = cc.fadeTo(time, 255);
        action1.easing(cc.easeIn(1));
        let action2 = cc.fadeTo(time, 0);
        action2.easing(cc.easeOut(1));
        if (isRed) {
            this.Lighting.runAction(cc.repeat(cc.sequence(action1, action2), 3));
        } else {
            this.Lighting.runAction(cc.repeatForever(cc.sequence(action1, action2)));
        }
    },
    bgMove(bgList) {
        for (var index = 0; index < bgList.length; index++) {
            var element = bgList[index];
            element.y -= this.bgSpeed;
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

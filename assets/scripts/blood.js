cc.Class({
    extends: cc.Component,

    properties: {
        HaemalCountLabel: cc.Node,
        NumLabel: cc.Node,
    },

    start() {

    },

    onInit(sumBlood) {
        this.sumBlood = sumBlood;
        this.curBlood = sumBlood;
        this.HaemalCountLabel.getComponent(cc.Label).string = "x" + this.sumBlood / 10;
        this.node.getComponent(cc.ProgressBar).progress = 1;
        this.onReset();
    },
    onReset() {
        this.num = 0;
        this.NumLabel.getComponent(cc.Label).string = "";
    },
    onSetBlood(increment) {
        this.curBlood = (this.curBlood - increment) > 0 ? (this.curBlood - increment) : 0;
        const xBlood = Math.ceil(this.curBlood / 10);
        const yBlood = this.curBlood % 10 == 0 ? 10 : this.curBlood % 10;
        if (this.curBlood == 0) {
            this.node.getComponent(cc.ProgressBar).progress = 0;
        } else {
            this.node.getComponent(cc.ProgressBar).progress = yBlood / 10;
        }
        this.HaemalCountLabel.getComponent(cc.Label).string = "x" + xBlood;
        this.onSetBloodNum(increment);
        return this.curBlood;
    },
    //减少数字
    onSetBloodNum(increment) {
        this.schedule(function () {
            this.NumLabel.getComponent(cc.Label).string = "-" + ++this.num;
        }, 0.25 / increment, increment - 1, 0);
        const action = cc.sequence(cc.spawn(cc.moveBy(0.15, cc.v2(0, 10)).easing(cc.easeBackIn(2)), cc.scaleTo(0.15, 1.2, 1.2)),
            cc.spawn(cc.moveBy(0.15, cc.v2(0, -10)).easing(cc.easeBackOut(2)), cc.scaleTo(0.15, 1, 1))
        );
        this.NumLabel.runAction(action);
    }
});

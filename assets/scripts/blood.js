cc.Class({
    extends: cc.Component,

    properties: {
        WhiltBar: cc.Node,
        HaemalCountLabel: cc.Node,
        NumLabel: cc.Node,
    },

    start() {

    },

    onInit(sumBlood) {
        this.sumBlood = sumBlood;
        this.curBlood = sumBlood;
        this.HaemalCountLabel.getComponent(cc.Label).string = "x" + this.sumBlood / 10;
        this.onReset();
    },
    onReset() {
        this.num = 0;
        this.NumLabel.getComponent(cc.Label).string = "";
    },
    onSetBlood(increment) {
        const oldBlood = this.curBlood;
        this.curBlood = (this.curBlood - increment) > 0 ? (this.curBlood - increment) : 0;
        const xBlood = Math.ceil(this.curBlood / 10);
        const yBlood = this.curBlood % 10 == 0 ? 10 : this.curBlood % 10;
        if(this.curBlood==0){
            this.node.getComponent(cc.ProgressBar).progress =0;
        }else{
            this.node.getComponent(cc.ProgressBar).progress = yBlood / 10;
        }
        this.HaemalCountLabel.getComponent(cc.Label).string = "x" + xBlood;
        const offset = oldBlood - this.curBlood;
        this.schedule(function () {
            this.NumLabel.getComponent(cc.Label).string = "-" + ++this.num;
        }, 0.25 / offset, offset - 1, 0);
        const action = cc.sequence(cc.spawn(cc.moveBy(0.15, cc.v2(0, 10)).easing(cc.easeBackIn(2)), cc.scaleTo(0.15, 1.2, 1.2)),
            cc.spawn(cc.moveBy(0.15, cc.v2(0, -10)).easing(cc.easeBackOut(2)), cc.scaleTo(0.15, 1, 1))
        );
        this.NumLabel.runAction(action);
        // this.WhiltBar.width = this.node.width * yBlood / 10;
        // let action1 = cc.fadeTo(0.1, 255);
        // action1.easing(cc.easeBackIn(2));
        // let action2 = cc.fadeTo(0.1, 0);
        // action2.easing(cc.easeBackOut(2));
        // const callF = cc.callFunc(() => {
        //     this.node.getComponent(cc.ProgressBar).progress = yBlood / 10;
        //     this.HaemalCountLabel.getComponent(cc.Label).string = "X" + xBlood;
        // });
        // this.WhiltBar.runAction(cc.sequence(action1, action2, callF));
        return this.curBlood;
    },
});

cc.Class({
    extends: cc.Component,

    properties: {
        ScrollView: cc.Node,
        ScrollContent: cc.Node,
        PreItem: cc.Prefab,
        dataJson: cc.JsonAsset,
        label: cc.Node,
    },

    start() {
        this.sum = 0;
        this.count = 0;
    },
    onKeyDown(event) {


    },

    onClick() {
        this.count++;
        this.schedule(function () {
            this.label.getComponent(cc.Label).string = ++this.sum;
        }, 0.2 / this.count, this.count, 0); //(function(){},间隔时间，次数，多久后开始)
        const action = cc.sequence(cc.spawn(cc.moveBy(0.2, cc.v2(0, 10)), cc.scaleTo(0.4, 1.2, 1.2)),
            cc.spawn(cc.moveBy(0.2, cc.v2(0, -10)), cc.scaleTo(0.4, 1, 1))
        );
        this.label.runAction(action);
    },
    getCurWriting() {

    }
});

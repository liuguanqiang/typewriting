cc.Class({
    extends: cc.Component,

    properties: {
        ScrollView: cc.Node,
        ScrollContent: cc.Node,
        PreItem: cc.Prefab,
        dataJson: cc.JsonAsset
    },

    start() {
        this.ScrollView.targetOff(this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);

        for (let i = 0; i < this.dataJson.json.level1.length; i++) {
            const level = this.dataJson.json.level1[i];
            const preItem = cc.instantiate(this.PreItem);
            preItem.getComponent("writingItem").SetText(level);
            this.ScrollContent.addChild(preItem);
        }
        this.scrollView = this.ScrollView.getComponent(cc.ScrollView);
        this.scrollView.scrollToBottom();
        this.curIndex = this.dataJson.json.level1.length - 1;
    },
    onKeyDown(event) {
        const code = String.fromCharCode(event.keyCode);
        if (code == this.getCurWriting()) {
            const curItem = this.ScrollContent.children[this.curIndex];
            if (curItem) {
                curItem.getComponent("writingItem").playParticle();
            }
            const curOffset = this.scrollView.getScrollOffset();
            this.scrollView.scrollToOffset(cc.v2(curOffset.x, curOffset.y - 50 - 20), 0.2);

            if (this.curIndex > 0) {
                --this.curIndex;
            }
            else {
                console.log("恭喜过关");
            }
        } else {
            console.log("失败");
        }

    },
    getCurWriting() {
        if (this.curIndex < this.dataJson.json.level1.length) {
            return this.dataJson.json.level1[this.curIndex];
        }
        return "";
    }
});

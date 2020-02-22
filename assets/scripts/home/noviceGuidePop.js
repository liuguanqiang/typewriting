var gameLocalData = require('gameLocalData');
cc.Class({
  extends: cc.Component,
  properties: {
    infoLab: cc.Node,
    textJson: cc.JsonAsset,
    arrowBtn: cc.Node,
    hintLab: cc.Node,
    shade: cc.Node,
    dialogBox: cc.Node,
  },
  start() {

  },
  onLoad() {
    this.shade.on('mousedown', this.onKeyDown, this);
    cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
  },

  onKeyDown() {
    if (this.node.active && this.hintLab.active) {
      this.onNext();
    }
  },

  //showArrowIndex在第几条文字时显示箭头
  onInit(index, showArrowDatas, isTop, cb) {
    this.hintLab.active = false;
    this.mouseIndex = -1;
    this.texts = this.textJson.json.texts[index].split("#");
    if (!showArrowDatas) {
      this.arrowBtn.active = false;
    }
    this.showArrowDatas = showArrowDatas;
    this.cb = cb;
    setTimeout(() => {
      this.hintLab.active = true;
      this.hintLab.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.6, 255), cc.fadeTo(0.6, 100))));
    }, 800);
    this.onNext();
    this.dialogBox.y = isTop ? 160 : -274;
  },
  onNext() {
    this.mouseIndex++;
    if (this.mouseIndex < this.texts.length) {
      this.infoLab.getComponent(cc.Label).string = this.texts[this.mouseIndex];
      if (this.showArrowDatas && this.showArrowDatas.length > 0) {
        const arrowData = this.showArrowDatas.find(a => a.showArrowIndex == this.mouseIndex);
        if (arrowData) {
          this.arrowBtn.stopAllActions();
          this.arrowBtn.active = true;
          this.arrowBtn.x = arrowData.x;
          this.arrowBtn.y = arrowData.y;
          this.arrowBtn.runAction(cc.repeatForever(cc.sequence(cc.moveTo(0.4, arrowData.x - 10, arrowData.y), cc.moveTo(0.4, arrowData.x, arrowData.y))));
        } else {
          this.arrowBtn.active = false;
        }
      }
    } else {
      this.hintLab.stopAllActions();
      this.arrowBtn.stopAllActions();
      this.node.active = false;
      if (this.cb) {
        this.cb();
      }
    }
  }
})
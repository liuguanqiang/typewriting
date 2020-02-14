cc.Class({
    extends: cc.Component,
    properties: {
        isScale: true,
        scaleRatio: 1.05,
    },
    start() {
        this.node.on('mouseenter', () => {
            cc.game.canvas.style.cursor = "pointer";
            if (this.isScale) {
                this.node.setScale(this.scaleRatio);
            }
        })
        this.node.on('mouseleave', () => {
            cc.game.canvas.style.cursor = "default";
            if (this.isScale) {
                this.node.setScale(1.0);
            }
        })
        this.node.on('mouseup', () => {
            cc.game.canvas.style.cursor = "default";
        })

    }
})
cc.Class({
    extends: cc.Component,

    properties: {
        WritingLab: cc.Node,
        particle: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },
    SetText(text) {
        this.WritingLab.getComponent(cc.Label).string = text;
    },

    playParticle() {
        const myParticle = this.particle.getComponent(cc.ParticleSystem);
        if (myParticle.particleCount > 0) { // check if particle has fully plaed
            myParticle.stopSystem(); // stop particle system
        } else {
            myParticle.resetSystem(); // restart particle system
        }
    }
    // update (dt) {},
});

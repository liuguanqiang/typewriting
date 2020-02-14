var localData = require('localData');

window.isShell = !!window.parent.nw;

//常驻节点的脚本
window.PersistRootJS = function () {
    let PersistRootNode = cc.director.getScene().getChildByName("persisRoot");
    window.PersistRootJSCache = PersistRootNode.getComponent("persisRoot");
    return window.PersistRootJSCache;
};

//常驻节点中http的脚本
window.HttpJS = function () {
    if (window.isShell) {
        return window.parent.HttpJS;
    }
    return window.PersistRootJS().getHttpJS();
};

//常驻节点中audio的脚本
window.AudioJS = function () {
    return window.PersistRootJS().getAudioJS();
};

//常驻节点中audio的脚本
window.UserJS = function () {
    return window.PersistRootJS().getUserJS();
};


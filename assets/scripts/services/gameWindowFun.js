window.isShell = !!window.parent.nw;

//常驻节点的脚本
window.GamePersistRootJS = function () {
    let PersistRootNode = cc.director.getScene().getChildByName("persisRoot");
    window.PersistRootJSCache = PersistRootNode.getComponent("persisRoot");
    return window.PersistRootJSCache;
};

//常驻节点中http的脚本
window.GameHttpJS = function () {
    if (window.isShell) {
        return window.parent.HttpJS();
    }
    return window.GamePersistRootJS().getHttpJS();
};

//常驻节点中audio的脚本
window.GameAudioJS = function () {
    return window.GamePersistRootJS().getAudioJS();
};

//常驻节点中audio的脚本
window.GameUserJS = function () {
    return window.GamePersistRootJS().getUserJS();
};

//视频链接
window.VideoUrl = function (name) {
    return "https://client-hot-update.oss-cn-beijing.aliyuncs.com/typingResource/" + name;
};


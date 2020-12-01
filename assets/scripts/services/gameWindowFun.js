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
    return "https://hotupdate.pipacoding.com/typingResource/" + name;
};

window.requestContentTrack = function (eventName, data) {
    //console.log("埋点： " + eventName, data);
    if (window.isShell) {
        window.parent.ShellJS().requestContentTrack(eventName, data);
    }
};

//将毫秒秒转化成“00:00:00”格式
window.GetSecond = (ms) => {
    let second = parseInt(ms / 1000);
    return second;

    // let h = 0, m = 0, s = 0;
    // if (second >= 60 * 60) {
    //     h = parseInt(second / (60 * 60));
    //     second -= h * 60 * 60;
    // }
    // if (second >= 60) {
    //     m = parseInt(second / (60));
    //     second = second - m * 60;
    // }
    // s = second;
    // h = h < 10 ? "0" + h : h;
    // m = m < 10 ? "0" + m : m;
    // s = s < 10 ? "0" + s : s;
    // return `${h}:${m}:${s}`;
}



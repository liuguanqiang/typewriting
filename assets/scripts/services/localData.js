var localData = {};
var getLocalData = function (key, callback, cancelBtnCallback) {
    localData = localData || {};
    // 返回缓存数据
    if (localData[key] !== undefined) {
        if (callback) callback(localData[key]);
        return localData[key];
    }
    // 进一步，查找本地数据
    let str = window.ShellJS().getLocalStorageItem(key);
    if (str == null || str === '') {
        localData[key] = null;
    } else {
        localData[key] = JSON.parse(str);
    }
    if (callback) callback(localData[key]);
    return localData[key];
};
var setLocalData = function (value, key) {
    localData = localData || {};
    localData[key] = value;
    var valueStr = JSON.stringify(value);

    // 写入本地数据
    if (valueStr !== window.ShellJS().getLocalStorageItem(key)) {
        window.ShellJS().setLocalStorageItem(key, valueStr);
        return true;
    }
    return false;
};
var setCacheData = function (value, key, additional) {
    for (var k in additional) {
        if (additional.hasOwnProperty(k)) {
            key += '__' + k + '_' + additional[k];
        }
    }
    localData[key] = value;
};
var getCacheData = function (key, additional) {
    for (var k in additional) {
        if (additional.hasOwnProperty(k)) {
            key += '__' + k + '_' + additional[k];
        }
    }
    // 返回缓存数据
    if (localData[key] !== undefined) {
        return localData[key];
    }
};
var removeCacheData = function (key, additional) {
    for (var k in additional) {
        if (additional.hasOwnProperty(k)) {
            key += '__' + k + '_' + additional[k];
        }
    }
    delete (localData[key]);
};

module.exports = {
    // ---------------------------------- 缓存数据 ----------------------------------
    set GameData(value) {
        return setCacheData(value, "gameData");
    },
    get GameData() {
        return getCacheData("gameData");
    },
    //用户选择进入游戏时缓存关卡数据
    set GotoGameData(value) {
        return setCacheData(value, "gotoGameData");
    },
    get GotoGameData() {
        return getCacheData("gotoGameData");
    },
    //用户整体游戏进度数据
    set GameProgressData(value) {
        return setCacheData(value, "gameProgressData");
    },
    get GameProgressData() {
        return getCacheData("gameProgressData");
    },

    // ---------------------------------- 本地数据 ----------------------------------
    //最新任务时间戳
    set TaskNewTime(value) {
        return setLocalData(value, 'taskNewTime_' + this.UserId);
    },
    get TaskNewTime() {
        return getLocalData('taskNewTime_' + this.UserId);
    },

};


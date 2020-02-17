var gameLocalData = {};
var getLocalData = function (key, callback, cancelBtnCallback) {
    gameLocalData = gameLocalData || {};
    // 返回缓存数据
    if (gameLocalData[key] !== undefined) {
        if (callback) callback(gameLocalData[key]);
        return gameLocalData[key];
    }
    // 进一步，查找本地数据
    let str = window.ShellJS().getLocalStorageItem(key);
    if (str == null || str === '') {
        gameLocalData[key] = null;
    } else {
        gameLocalData[key] = JSON.parse(str);
    }
    if (callback) callback(gameLocalData[key]);
    return gameLocalData[key];
};
var setLocalData = function (value, key) {
    gameLocalData = gameLocalData || {};
    gameLocalData[key] = value;
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
    gameLocalData[key] = value;
};
var getCacheData = function (key, additional) {
    for (var k in additional) {
        if (additional.hasOwnProperty(k)) {
            key += '__' + k + '_' + additional[k];
        }
    }
    // 返回缓存数据
    if (gameLocalData[key] !== undefined) {
        return gameLocalData[key];
    }
};
var removeCacheData = function (key, additional) {
    for (var k in additional) {
        if (additional.hasOwnProperty(k)) {
            key += '__' + k + '_' + additional[k];
        }
    }
    delete (gameLocalData[key]);
};

module.exports = {
    // ---------------------------------- 缓存数据 ----------------------------------
    set GameData(value) {
        return setCacheData(value, "gameData");
    },
    get GameData() {
        return getCacheData("gameData");
    },
    // ---------------------------------- 缓存数据 ----------------------------------
    set UserID(value) {
        return setCacheData(value, "userID");
    },
    get UserID() {
        return getCacheData("userID");
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


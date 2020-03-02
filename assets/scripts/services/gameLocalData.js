require('gameWindowFun');
var gameLocalData = {};

var getLocalData = function (key) {
    gameLocalData = gameLocalData || {};
    // 返回缓存数据
    if (gameLocalData[key] !== undefined) {
        return gameLocalData[key];
    }
    if (window.isShell) {
        // 进一步，查找本地数据
        let str = window.parent.ShellJS().getLocalStorageItem(key);
        if (str == null || str === '') {
            gameLocalData[key] = null;
        } else {
            gameLocalData[key] = JSON.parse(str);
        }
    }
    return gameLocalData[key];
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
module.exports = {
    set UserId(value) {
        return setCacheData(value, "userId");
    },
    get UserId() {
        return getLocalData("userId");
    },

    //音乐音量
    set MusicVolum(value) {
        return setCacheData(value, 'musicVolum');
    },
    get MusicVolum() {
        getLocalData('musicVolum');
    },

    //音效音量
    set SoundVolum(value) {
        return setCacheData(value, 'soundVolum');
    },
    get SoundVolum() {
        getLocalData('soundVolum');
    },


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

    //暂停
    set IsPause(value) {
        return setCacheData(value, "isPause");
    },
    get IsPause() {
        return getCacheData("isPause");
    },
    //进入游戏时间
    set StratTime(value) {
        return setCacheData(value, "stratTime");
    },
    get StratTime() {
        return getCacheData("stratTime");
    },
};


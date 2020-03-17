var gameLocalData = require('gameLocalData');
require('gameWindowFun');
cc.Class({
    extends: cc.Component,
    properties: {

    },
    onLoad() {

    },

    requestSetUserPorgress(param, callback) {
        window.GameHttpJS().sendPost("/einstein-logic/v1/typingGame/progress", (response, xhr) => {
            if (response && response.data) {
                if (callback) callback();
            }
        }, param, () => {
            window.requestContentTrack("typingSetUserPorgress_error");
        });
    },

    requestGetUserList(userId, callback) {
        window.GameHttpJS().sendGet(`/einstein-logic/v1/typingGame/progressByFilter?current=1&pageSize=1000&order=id&sortMode=ascend&filter={"userId": ${userId}}`, (response, xhr) => {
            if (response) {
                if (callback) callback(response.data);
            } else {
                if (callback) callback(null);
            }
        }, () => {
            window.requestContentTrack("typingGetUserList_error");
        });
    },
});
var localData = require('localData');
require('windowFun');
cc.Class({
    extends: cc.Component,
    properties: {

    },
    onLoad() {

    },

    requestSetUserPorgress(callback, param) {
        window.HttpJS().sendPost("/einstein-logic/v1/typingGame/progress", (response, xhr) => {
            if (response && response.data) {
                if (callback) callback();
            }
        }, param);
    },

    requestGetUserList(callback, userId = 123123) {
        window.HttpJS().sendGet(`/einstein-logic/v1/typingGame/progressByFilter?current=1&pageSize=1000&order=id&sortMode=ascend&filter={"userId": ${userId}}`, (response, xhr) => {
            if (response) {
                if (callback) callback(response.data);
            } else {
                if (callback) callback(null);
            }
        });
    },
});
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
            console.log("response", response)
            if (response && response.data) {
                if (callback) callback();
            } else {

            }
        }, param);
    },

    requestGetUserList(callback, userId = "123456") {
        const filter = { "userId": 123456 }
        window.HttpJS().sendGet(`/einstein-logic/v1/typingGame/progressByFilter?current=1&pageSize=1000&order=id&sortMode=descend&filter={"userId": 123456}`, (response, xhr) => {
            console.log("response", response)
            if (response) {
                if (callback) callback(response.data);
            } else {
                if (callback) callback(null);
            }
        });
    },
});
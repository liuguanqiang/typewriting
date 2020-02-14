var k_timeout = 15 * 1000;

cc.Class({
    extends: cc.Component,

    properties: {
        _messageArray: [],
    },

    // use this for initialization
    onLoad() {
        this.repeateRequestArray = [];
    },

    initHttp() {
        if (window.isIOS) {
            this.urlStr = base.url;
        } else {
            this.urlStr = "https://api.testing8.hetao101.com";
        }
    },

    // 发送消息 
    sendGet(urlStr, callback, errorCallback, header, cancelBtnCallback, param) {
        urlStr = this.urlStr + urlStr;
        if (urlStr.indexOf("?") >= 0) {
            urlStr = urlStr + "&t=" + (new Date()).valueOf();
        } else {
            urlStr = urlStr + "?t=" + (new Date()).valueOf();
        }
        this._messageArray.push({
            type: 'GET',
            url: urlStr,
            callback: callback,
            'errorCallback': errorCallback,
            header: header,
            cancelBtnCallback: cancelBtnCallback,
            param: param,
        });
        return this;
    },
    sendPost(urlStr, callback, sendData, errorCallback, header, isNoErrorTip, param, cancelBtnCallback) {
        urlStr = this.urlStr + urlStr;
        if (urlStr.indexOf("?") >= 0) {
            urlStr = urlStr + "&t=" + (new Date()).valueOf();
        } else {
            urlStr = urlStr + "?t=" + (new Date()).valueOf();
        }
        this._messageArray.push({
            type: 'POST',
            url: urlStr,
            callback: callback,
            sendData: sendData,
            'errorCallback': errorCallback,
            header: header,
            isNoErrorTip: isNoErrorTip,
            param: param,
            cancelBtnCallback: cancelBtnCallback,
        });
        return this;
    },
    sendPut(urlStr, callback, sendData) {
        urlStr = this.urlStr + urlStr;
        this._messageArray.push({
            type: 'PUT',
            url: urlStr,
            callback: callback,
            sendData: sendData
        });
        return this;
    },
    sendDelete(urlStr, callback, sendData, header) {
        urlStr = this.urlStr + urlStr;
        this._messageArray.push({
            type: 'DELETE',
            url: urlStr,
            callback: callback,
            sendData: sendData,
            header: header,
        });
        return this;
    },
    sendMessegeOnly(url, sendData, header) {//仅发送消息 不触发任何回掉
        this._messageArray.push({
            type: 'POST',
            url: url,
            callback: null,
            sendData: sendData,
            header: header,
            isSendMessegeOnly: true,
        });
        return this;
    },

    // 私有方法
    // 消息发送循环
    update() {
        if (this._messageArray.length === 0) {
            return;
        }
        var info = this._messageArray[0];
        var type = info.type;
        var url = info.url;
        var sendData = info.sendData;

        // 消息发送
        var xhr = new XMLHttpRequest();
        xhr.open(type, url);
        // xhr.withCredentials = true;
        xhr.timeout = k_timeout;
        xhr.responseType = 'json';
        // 设置回调
        if (!info.isSendMessegeOnly) {
            xhr.onload = event => this._onload(xhr, info, event);
            xhr.ontimeout = event => this._ontimeout(xhr, info, event);
            xhr.onerror = event => this._onerror(xhr, info, event);
        }

        if (!!info.header) {
            if (Array.isArray(info.header)) {
                for (let m = 0; m < info.header.length; ++m) {
                    xhr.setRequestHeader(info.header[m].header, info.header[m].value);
                }
            } else {
                xhr.setRequestHeader(info.header.header, info.header.value);
            }
        }
        xhr.setRequestHeader("X-Client-Version", "1.0.0");
        xhr.setRequestHeader("x-platform", "CLIENT");
        if (type === 'POST' || type === 'PUT') {
            if (sendData === undefined || sendData === null) {
                xhr.send();
            } else if (typeof (sendData) === 'object') {
                sendData = JSON.stringify(sendData);
                xhr.send(sendData);
            } else if (typeof (sendData) === 'string') {
                xhr.send(sendData);
            }
        } else {
            xhr.send();
        }

        // 发送完毕，从队列删除
        this._messageArray.splice(0, 1);
    },

    // 消息完成
    _onload(xhr, info, evnet) {
        if (!cc.isValid(this.node)) {
            cc.log('_onload，节点已无效，放弃回调');
            return;
        }

        if (xhr.responseType != 'json' && xhr.responseText == "") {
            cc.log("--------Http responseText 为空----" + info.url);
            return;
        }
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
            //var response = new Object();
            var response = null;

            if (xhr.responseType == "json") {
                response = xhr.response;
            } else {
                response = xhr.responseText;
            }
            //
            cc.log("<------------------------\ntype=" + info.type + " url=" + info.url + " \n消息完成状态" + xhr.status + " \n收到消息:" + JSON.stringify(response) + "\n--------------------->");
            if (response && response.errcode && (response.errcode != 0)) {
                cc.log(response.errcode);
            } else {
                if (info.callback) info.callback(response, xhr);
            }
        }
        else {
            cc.log('消息完成状态', xhr.status);
            // 显示提示界面
            var str = null;
            if (xhr.status === 400) {
                var response = {}
                if (xhr.responseType == "json") {
                    response = xhr.response;
                } else {
                    response = xhr.responseText;
                }

                if (response.message) {
                    str = response.message;
                }
            } else {
            }
            if (info.errorCallback) {
                info.errorCallback();
            }
        }
    },
    // 消息超时
    _ontimeout(xhr, info, evnet) {
        if (typeof (info.errorCallback) == 'function' && cc.isValid(this.node)) {
            info.errorCallback(xhr);
        }
        if (!cc.isValid(this.node)) {
            cc.log('_ontimeout，节点已无效，放弃回调');
            return;
        }
        cc.log('消息超时 ' + info.url);
    },
    // 消息错误
    _onerror(xhr, info, evnet) {
        if (typeof (info.errorCallback) == 'function' && cc.isValid(this.node)) {
            info.errorCallback(xhr);
        }
        if (!cc.isValid(this.node)) {
            cc.log('_onerror，节点已无效，放弃回调');
            return;
        }
    },


    clearMessageArray() {
        this._messageArray = [];
        this.repeateRequestArray = [];
    },
});
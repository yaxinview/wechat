'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');


var config = {
    wechat: {
        appID: 'type yourself appID',
        appSecret: 'type yourself appSecret',
        token: 'type',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);

            return util.writeFileAsync(wechat_file, data);
        }
    }
}

module.exports = config;

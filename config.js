'use strict'

var path = require('path');
var util = require('./libs/util');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var wechat_ticket_file = path.join(__dirname, './config/wechat_ticket.txt');


var config = {
    wechat: {
        appID: 'wx7dc0e708e5cf4195',
        appSecret: '8b912bec237b1104ff4598d4f816bd4b',
        token: 'yaxinview',
        getAccessToken: function() {
            return util.readFileAsync(wechat_file)
        },
        saveAccessToken: function(data) {
            data = JSON.stringify(data);

            return util.writeFileAsync(wechat_file, data);
        },
        getTicket: function() {
            return util.readFileAsync(wechat_ticket_file)
        },
        saveTicket: function(data) {
            data = JSON.stringify(data);

            return util.writeFileAsync(wechat_ticket_file, data);
        }
    }
}

module.exports = config;

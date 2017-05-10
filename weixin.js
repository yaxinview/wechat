'use strict'

var config = require('./config');
var Wechat = require('./wechat/wechat');

var wechatApi = new Wechat(config.wechat);

exports.reply = function* (next) {
    var message = this.weixin;
    if (message.MsgType === 'event') {
        if (message.Event === 'subscribe') {
            if (message.EventKey) {
                console.log('扫描二维码进来：' + message.EventKey + ' ' + message.ticket)
            }

            this.body = '订阅成功，棒棒哒\r\n';
        }
        else if (message.Event === 'unsubscribe') {
            console.log('无情取关')
            this.body = '';
        }
    }
    else if (message.Event === 'LOCATION') {
        this.body = '您上报的位置是： ' + message.Latitude + '/' + 
          message.Longitude + '-' + message.Precision;
    }
    else if (message.Event === 'CLICK') {
        this.body = '您点击了菜单 ； ' + message.EventKey;
    }
    else if (message.Event === 'SCAN') {
        console.log('关注后扫描二维码' + message.EventKey + ' ' + message.Ticket);
    }
    else if (message.Event === 'VIEW') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
    }
    else if (message.MsgType === 'text') {
        var content = message.Content;
        var reply = '你说的' + content + '听不懂';

        if (content === '1') {
            reply = '天下第一吃大米';
        }
        else if (content === '2') {
            reply = '天下第二吃仙丹';
        }
        else if (content === '4') {
            reply = [{
                title: '最爱阿森纳',
                description: '只是个描述而已',
                picUrl: 'http://img2.hupucdn.com/photo/e96bab8bjpg_100x100_2014-11-22.jpg',
                url: 'http://cn.arsenal.com/'
            }];
        }
        else if (content === '5') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + 
                '/2.png')
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', __dirname + 
                '/wenger.mp4')
            console.log(data)
            reply = {
                type: 'video',
                title: '终于看到视频啦',
                description: '妹纸，深夜敲代码厉害了',
                mediaId: data.media_id
            }
            console.log(reply)
        }
        else if (content === '7') {
            var data = yield wechatApi.uploadMaterial('image', __dirname + 
                '/2.png')
            console.log(data)
            reply = {
                type: 'music',
                title: '想听音乐吗',
                description: '音乐响起来~~~',
                musicUrl: 'http://sc1.111ttt.com/2016/5/12/10/205101338233.mp3',
                thumbMediaId: data.media_id
            }
            console.log(reply)
        }

        this.body = reply;
    }

    yield next;
}
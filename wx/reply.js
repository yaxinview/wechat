'use strict'

var path = require('path');
var config = require('../config');
var Wechat = require('../wechat/wechat');
var menu = require('./menu');
var wechatApi = new Wechat(config.wechat);

wechatApi.deleteMenu().then(function(){
    return wechatApi.createMenu(menu)
})
.then(function(msg) {
    console.log(msg)
})


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
    else if (message.Event === 'scancode_push') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.ScanCodeInfo.ScanType)
        console.log(message.ScanCodeInfo.ScanResult)
    }
    else if (message.Event === 'scancode_waitmsg') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.ScanCodeInfo.ScanType)
        console.log(message.ScanCodeInfo.ScanResult)
    }
    else if (message.Event === 'pic_sysphoto') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.SendPicsInfo.PicList)
        console.log(message.SendPicsInfo.Count)
    }
    else if (message.Event === 'pic_photo_or_album') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.SendPicsInfo.PicList)
        console.log(message.SendPicsInfo.Count)
    }
    else if (message.Event === 'pic_weixin') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.SendPicsInfo.PicList)
        console.log(message.SendPicsInfo.Count)
    }
    else if (message.Event === 'location_select') {
        this.body = '您点击了菜单链接： ' + message.EventKey;
        console.log(message.SendLocationInfo.Location_X)
        console.log(message.SendLocationInfo.Location_Y)
        console.log(message.SendLocationInfo.Scale)
        console.log(message.SendLocationInfo.Label)
        console.log(message.SendLocationInfo.Poiname)
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, 
                '../2.png'))
            console.log(data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if (content === '6') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, 
                '../wenger.mp4'))
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
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, 
                '../2.png'))
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
        else if (content === '8') {
            var data = yield wechatApi.uploadMaterial('image', path.join(__dirname, 
                '../2.png'), {type: 'image'})
            console.log(data)
            reply = {
                type: 'image',
                mediaId: data.media_id
            }
        }
        else if (content === '9') {
            var data = yield wechatApi.uploadMaterial('video', path.join(__dirname, 
                '../wenger.mp4'), {type: 'video', description: '{"title": "Wenger", "introduction": "Wenger In"}'})
            console.log(data)
            reply = {
                type: 'video',
                title: '想看视频吗',
                description: 'Wenger In',
                mediaId: data.media_id
            }
            console.log(reply)
        }
        else if (content === '10') {
            var picData = yield wechatApi.uploadMaterial('image', path.join(__dirname, 
                '../2.png'), {})
            console.log(picData)
            var media = {
                articles: [{
                  title: 'tututu4',
                  thumb_media_id: picData.media_id,
                  author: 'Scott',
                  digest: '没有摘要',
                  show_cover_pic: 1,
                  content: '没有内容',
                  content_source_url: 'https://github.com'
                }, {
                  title: 'tututu5',
                  thumb_media_id: picData.media_id,
                  author: 'Scott',
                  digest: '没有摘要',
                  show_cover_pic: 1,
                  content: '没有内容',
                  content_source_url: 'https://github.com'
                }]
            }

            data = yield wechatApi.uploadMaterial('news', media, {})
            data = yield wechatApi.fetchMaterial(data.media_id, 'news', {})

            console.log(data)

            var items = data.news_item;
            var news = [];

            items.forEach(function(item) {
                news.push({
                    title: item.title,
                    description: item.digest,
                    picUrl: item.url
                })
            })
            reply = news;
        }
        else if (content === '18') {
            var temQr = {
                expire_seconds: '604800',
                action_name: 'QR_SCENE',
                action_info: {
                    scene: {
                        scene_id: '123'
                    }
                }
            }
            var permQr = {
                action_name: 'QR_LIMIT_SCENE',
                action_info: {
                    scene: {
                        scene_id: '123'
                    }
                }
            }
            var permStrQr = {
                action_name: 'QR_LIMIT_STR_SCENE',
                action_info: {
                    scene: {
                        scene_str: 'abc'
                    }
                }
            }

            var qr1 = yield wechatApi.createQrcode(temQr)
            var qr2 = yield wechatApi.createQrcode(permQr)
            var qr3 = yield wechatApi.createQrcode(permStrQr)

            console.log(qr1)
            console.log(qr1)
            console.log(qr1)


            reply = 'Oh Yeah';
        }
        else if (content === '19') {
            var longUrl = 'http://www.yaxinview.com';
            var shortData = yield wechatApi.createShorturl(null, longUrl)

            reply = shortData.short_url;
        }
        else if (content === '20') {
            var semanticData = {
                query: '查一下明天从北京到深圳的南航机票',
                city: '深圳',
                category: 'flight'
            }


            var _semanticData = yield wechatApi.semantic(semanticData)
            console.log(_semanticData)

            reply = JSON.stringify(_semanticData);
        }

        this.body = reply;
    }

    yield next;
}
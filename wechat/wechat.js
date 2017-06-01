'use strict'

var Promise = require('bluebird');
var _ = require('lodash');
var request = Promise.promisify(require('request'));
var util = require('./util');
var fs = require('fs');
var prefix = 'https://api.weixin.qq.com/cgi-bin/';
var mpPrefix = 'https://mp.weixin.qq.com/cgi-bin/';
var semanticUrl = 'https://api.weixin.qq.com/semantic/semproxy/search?';
var api = {
    semanticUrl: semanticUrl,
    access_token: prefix + 'token?grant_type=client_credential',
    temporary: {
        upload: prefix + 'media/upload?',
        fetch: prefix + 'media/get?'
    },
    permanent: {
        upload: prefix + 'material/add_material?',
        uploadNews: prefix + 'material/add_news?',
        uploadNewsPic: prefix + 'media/uploadimg?',
        fetch: prefix + 'material/get_material?',
        del: prefix + 'media/del_material?',
        update: prefix + 'media/update_news?',
        count: prefix + 'material/get_materialcount?',
        batch: prefix + 'material/batchget_material?'
    },
    menu: {
    create: prefix + 'menu/create?',
    get: prefix + 'menu/get?',
    del: prefix + 'menu/delete?',
    current: prefix + 'get_current_selfmenu_info?'
    },
    qrcode: {
      create: prefix + 'qrcode/create?',
      show: mpPrefix + 'showqrcode?'
    },
    shortUrl: {
      create: prefix + 'shorturl?'
    },
    ticket: {
      get: prefix + 'ticket/getticket?'
    }
    
}

function Wechat(opts) {
    var that = this;
    this.appID = opts.appID;
    this.appSecret = opts.appSecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getTicket = opts.getTicket;
    this.saveTicket = opts.saveTicket;
    this.fetchAccessToken();

}

Wechat.prototype.fetchAccessToken = function(data) {
    var that = this;

    return this.getAccessToken()
      .then(function(data) {
        try {
            data = JSON.parse(data);        }
        catch(e) {
            return that.updateAccessToken(data);
        }

        if (that.isValidAccessToken(data)) {
            return Promise.resolve(data);
        }
        else {
            return that.updateAccessToken()
        }
      })

      .then(function(data) {
        that.saveAccessToken(data)
        return Promise.resolve(data);
      })
} 

Wechat.prototype.fetchTicket = function(access_token) {
    var that = this;

    return this.getTicket()
      .then(function(data) {
        try {
            data = JSON.parse(data);
        }
        catch(e) {
            return that.updateTicket(access_token);
        }

        if (that.isValidTicket(data)) {
            return Promise.resolve(data);
        }
        else {
            return that.updateTicket(access_token)
        }
      })

      .then(function(data) {
        that.saveTicket(data)
        return Promise.resolve(data);
      })
} 

Wechat.prototype.updateAccessToken = function() {
    var appID = this.appID;
    var appSecret = this.appSecret;
    var url = api.access_token + '&appID=' + appID + '&secret=' + appSecret;

    return new Promise(function(resolve, reject) {

        request({url: url, json: true}).then(function(response) {
            var data = response.body;
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;

            resolve(data)

        })
    })    
}

Wechat.prototype.updateTicket = function(access_token) {
    var url = api.ticket.get + '&access_token=' + access_token + '&type=jsapi'

    return new Promise(function(resolve, reject) {

        request({url: url, json: true}).then(function(response) {
            var data = response.body;
            var now = (new Date().getTime());
            var expires_in = now + (data.expires_in - 20) * 1000;

            data.expires_in = expires_in;

            resolve(data)

        })
    })    
}

Wechat.prototype.isValidAccessToken = function(data) {
    if(!data || !data.access_token || !data.expires_in) {
        return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if (now < expires_in) {
        return true;
    }
    else {
        return false;
    }
}

Wechat.prototype.isValidTicket = function(data) {
    if(!data || !data.ticket || !data.expires_in) {
        return false;
    }

    var ticket = data.ticket;
    var expires_in = data.expires_in;
    var now = (new Date().getTime());

    if (ticket && now < expires_in) {
        return true;
    }
    else {
        return false;
    }
}

Wechat.prototype.uploadMaterial = function(type, material, permanent) {
    var that = this;
    var form = {};
    var uploadUrl = api.temporary.upload;

    if (permanent) {
        uploadUrl = api.permanent.upload;

        _.extend(form, permanent)
    }

    if (type === 'pic') {
        uploadUrl = api.temporary.uploadNewsPic;
    }

    if (type === 'news') {
        uploadUrl = api.temporary.uploadNews;
        form = material;
    }
    else {
        form.media = fs.createReadStream(material);
    }
    console.log(uploadUrl)

    console.log(form)


    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = uploadUrl + 'access_token=' + data.access_token;

            if (!permanent) {
                url += '&type=' + type;
            }
            else {
                form.access_token = data.access_token;
            }

            console.log(url)

            var options = {
                method: 'POST',
                url: url,
                json: true
            }

            if (type === 'news') {
                options.body = form;
            }
            else {
                options.formData = form;
            }
              request({method: 'POST', url: url, formData: form, json: true}).then(function(response) {
                    var _data = response.body;                    
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        throw new Error('Upload material fails');
                    }
                })
                .catch(function(err) {
                    reject(err)
                })
          })

        
    })    
}

Wechat.prototype.fetchMaterial = function(mediaId, type, permanent) {
    var that = this;
    var fetchUrl = api.temporary.fetch;

    if (permanent) {
        fetchUrl = api.permanent.fetch;
    }

    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = fetchUrl + 'access_token=' + data.access_token;
            var form = {};
            var options = {method: 'POST', url: url, json: true};

            if (permanent) {
                form.media_id = mediaId;
                form.access_token = data.access_token;
                options.body = form;
            }
            else {
                if (type === 'video') {
                    url = url.replace('https://', 'http://');
                }
                url += '&media_id=' + mediaId;
            }
            if (type === 'news' || type === 'video') {
                request(options).then(function(response) {
                    var _data = response.body;
                    if (_data) {
                            resolve(_data);
                        }
                        else {
                            throw new Error('Update material fails');
                        }
                    })
                    .catch(function(err) {
                        reject(err)                   
                })
            }
            else {
                resolve(url)
            }
          })        
    })    
}


Wechat.prototype.deleteMaterial = function(mediaId) {
    var that = this;
    var form = {
        media_id: mediaId
    };

    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = api.permanent.del + 'access_token=' + data.access_token + '&media_id=' + mediaId;

             request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body;                    
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        throw new Error('Delete material fails');
                    }
                })
                .catch(function(err) {
                    reject(err)
                })

          })        
    })    
}

Wechat.prototype.updateMaterial = function(mediaId, news) {
    var that = this;
    var form = {
        media_id: mediaId
    };

    _.extend(form, news)

    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = api.permanent.update + 'access_token=' + data.access_token + '&media_id=' + mediaId;

             request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
                    var _data = response.body;                    
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        throw new Error('Update material fails');
                    }
                })
                .catch(function(err) {
                    reject(err)
                })

          })        
    })    
}

Wechat.prototype.countMaterial = function() {
    var that = this;

    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = api.permanent.count + 'access_token=' + data.access_token;

             request({method: 'GET', url: url, json: true}).then(function(response) {
                    var _data = response.body;                    
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        throw new Error('Update material fails');
                    }
                })
                .catch(function(err) {
                    reject(err)
                })

          })        
    })    
}

Wechat.prototype.batchMaterial = function(options) {
    var that = this;

    options.type = options.type || 'image';
    options.offset = options.offset || '0';
    options.count = options.count || '1';

    return new Promise(function(resolve, reject) {
        that
          .fetchAccessToken()
          .then(function(data) {
            var url = api.permanent.batch + 'access_token=' + data.access_token;

             request({method: 'POST', url: url, body: options, json: true}).then(function(response) {
                    var _data = response.body;                    
                    if (_data) {
                        resolve(_data);
                    }
                    else {
                        throw new Error('Update material fails');
                    }
                })
                .catch(function(err) {
                    reject(err)
                })

          })        
    })    
}


Wechat.prototype.createMenu = function(menu) {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.menu.create + 'access_token=' + data.access_token

        request({method: 'POST', url: url, body: menu, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Create menu fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.getMenu = function(menu) {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.menu.get + 'access_token=' + data.access_token

        request({url: url, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Get menu fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.deleteMenu = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.menu.del + 'access_token=' + data.access_token

        request({url: url, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Delete menu fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.getCurrentMenu = function() {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.menu.current + 'access_token=' + data.access_token

        request({url: url, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Get current menu fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.createQrcode = function(qr) {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.qrcode.create + 'access_token=' + data.access_token

        request({method: 'POST', url: url, body: qr, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Create qr fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.showQrcode = function(ticket) {
  return api.qrcode.show + 'ticket=' + encodeURI(ticket);
}

Wechat.prototype.createShorturl = function(action, url) {
  var action = action || 'long2short'
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.shortUrl.create + 'access_token=' + data.access_token
        var form = {
          action: action,
          long_url: url
        }

        request({method: 'POST', url: url, body: form, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Create shorturl fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}

Wechat.prototype.semantic = function(semanticData) {
  var that = this

  return new Promise(function(resolve, reject) {
    that
      .fetchAccessToken()
      .then(function(data) {
        var url = api.semanticUrl + 'access_token=' + data.access_token
        semanticData.appid = data.appID;
        console.log(url)
        console.log(semanticData)

        request({method: 'POST', url: url, body: semanticData, json: true}).then(function(response) {
          var _data = response.body

          if (_data) {
            resolve(_data)
          }
          else {
            throw new Error('Semantic fails')
          }
        })
        .catch(function(err) {
          reject(err)
        })
      })
  })
}


Wechat.prototype.reply = function() {
    var content = this.body;
    var message = this.weixin;

    var xml = util.tpl(content, message)

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml;
          

}

module.exports = Wechat;
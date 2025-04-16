var app = require('express')();
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('./private.pem', 'utf8');
var certificate = fs.readFileSync('./file.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);
var PORT = 12345;
var SSLPORT = 443;
var ReqCount = 0;

httpServer.listen(PORT, function() {
    console.log('HTTP Server is running on: http://localhost:%s', PORT);
});
httpsServer.listen(SSLPORT, function() {
    console.log('HTTPS Server is running on: https://localhost:%s', SSLPORT);
});


httpServer.keepAliveTimeout = 30 * 1000;

let json = {
    code: 200,
    msg: 'request success',
    data: {
        userId: '123456',
        name: 'xiaobai',
        blog: 'http://www.xiaobaigis.com'
    }
}
var HashMap = require('hashmap');
var tabTags = new HashMap();
function InsertTags(tags) {
    if (tags.length > 0) {
        tags.forEach(tag => {
            var tag_ = tabTags.get(tag.ep);
            if (tag_ != null) {
                if (tag.hasOwnProperty('bd'))
                    tag_.bd = tag.bd;
                if (tag.hasOwnProperty('at'))
                    tag_.at = tag.at;
                if (tag.hasOwnProperty('rc'))
                    tag_.rc += tag.rc;
                if (tag.hasOwnProperty('fq'))
                    tag_.fq += tag.fq;
                if (tag.hasOwnProperty('pt'))
                    tag_.fq += tag.pt;
                if (tag.hasOwnProperty('ri'))
                    tag_.ri += tag.ri;
                if (tag.hasOwnProperty('rv'))
                    tag_.rv += tag.rv;
                if (tag.hasOwnProperty('ft'))
                    tag_.ft += tag.ft;
                if (tag.hasOwnProperty('lt'))
                    tag_.lt += tag.lt;
            } else
                tabTags.set(tag.ep, tag);
        });
    }
}
var path = require('path');
var bodyParser = require('body-parser');//用于req.body获取值的
app.use(bodyParser.json());
// 创建 application/x-www-form-urlencoded 编码解析
//app.use(bodyParser.urlencoded({ extended: false }));

// Welcome
app.post('/', function(req, res) {
    if (req.protocol === 'https') {
//        console.log(JSON.stringify(req.body));
        console.log(req.body);
        ReqCount++;
        if (ReqCount == 10) {
            ReqCount = 0;
            req.connection.destroy();
        } else
            res.send(json);
    }
    else {
//        console.log(JSON.stringify(req.body));
        console.log(req.body);
//        InsertTags(req.body.event_data);

 //       var setgpo = '{"command_type":"reboot","command_data":{}}';
        var dateBase = new Date();
        var timeSecond = parseInt(dateBase.getTime()/1000);
        var sync_time = '{"command_type":"sync_time","command_data":' + timeSecond + '}';
        res.send(sync_time);
//        res.send(setgpo);
    }
});

app.get('/', function (req, res) {
    if (req.protocol === 'https') {

        ReqCount++;
        if (ReqCount == 10) {
            ReqCount = 0;
            req.connection.destroy();
        } else
            res.send(json);
    }
    else {
        console.log(req.body);

        res.send(json);
    }
});
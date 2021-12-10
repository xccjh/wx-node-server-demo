/* eslint-env node */

var express = require("express");
var app = express();
var http = require("http");
var crypto = require('crypto')
var getRawBody = require('raw-body');
var util = require("./util");
var {getConfigData, getErWeMaData} = require("./wx.js");

var port = "3000";

var help = '欢迎关注本服务号!';

// 在浏览器中打开 下面执行
//const opn = require("opn");

// 启动压缩
var compression = require("compression");
app.use(compression());

// 静态页面路径
app.use(express.static("./dist"));
app.set("port", port);

// 启动server
var server = http.createServer(app);
server.listen(port);

// 获取jssdk配置数据
app.get("/api/configdata", function (req, res) { //获取配置
    getConfigData(req.query.href).then((result) => {
        res.send(result);
    });
});

// 生成场景值二维码ticket
app.get('/api/erweima', function (req, res) {
    getErWeMaData().then((result) => {
        res.send(result.data);
    });
})

// 接入用户授权和自动回复
app.use('/auth', async (req, res) => {
        var signature = req.query.signature,//微信加密签名
            timestamp = req.query.timestamp,//时间戳
            nonce = req.query.nonce,//随机数
            echostr = req.query.echostr;//随机字符串
        //2.将token、timestamp、nonce三个参数进行字典序排序
        var array = ['xccjh', timestamp, nonce];
        array.sort();
        //3.将三个参数字符串拼接成一个字符串进行sha1加密
        var tempStr = array.join('');
        const hashCode = crypto.createHash('sha1'); //创建加密类型
        var resultCode = hashCode.update(tempStr, 'utf8').digest('hex'); //对传入的字符串进行加密
        //4.开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
        if (req.method === 'GET') {
            if (resultCode === signature) {
                res.send(echostr);
            } else {
                res.send('mismatch');
            }
        } else {
            if (resultCode !== signature) {
                res.send('mismatch');
            } else {
                const data = await getRawBody(req)
                const content = await util.parseXML(data)
                const message = util.formatMessage(content.xml)
                let reply = ''
                if (message.MsgType === 'voice') { // 语音

                } else if (message.MsgType === 'image') { // 图片
                    console.log(message.PicUrl)
                } else if (message.MsgType === 'event') {
                    if (message.Event === 'subscribe') { // 订阅事件
                        if (message.EventKey && message.Ticket) {
                            reply = [{
                                title: '欢迎订阅,扫二维码的关注',
                                description: '扫码参数' + message.EventKey + '_' + message.Ticket,
                                picUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                                url: 'http://xccjh.gz2vip.91tunnel.com/static/'
                            }]
                        } else {
                            reply = help;
                        }
                    } else if (message.Event === 'unsubscribe') { // 取消订阅
                        reply = '取消订阅了'
                    } else if (message.Event === 'SCAN') { // 关注后扫二维码事件
                        reply = [{
                            title: '关注后扫二维码',
                            description: '扫码参数' + message.EventKey + '_' + message.Ticket,
                            picUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                            url: 'http://xccjh.gz2vip.91tunnel.com/static/'
                        }]
                    }
                } else if (message.Event === 'LOCATION') {
                    console.log(`您上报的位置是：${message.Latitude}-${message.Longitude}-${message.Precision}`)
                } else if (message.Event === 'CLICK') {
                    console.log('你点击了菜单的： ' + message.EventKey)
                } else if (message.Event === 'VIEW') {
                    console.log('你点击了菜单链接： ' + message.EventKey + ' ' + message.MenuId)
                } else if (message.Event === 'scancode_push') {
                    console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
                } else if (message.Event === 'scancode_waitmsg') {
                    console.log('你扫码了： ' + message.ScanCodeInfo.ScanType + ' ' + message.ScanCodeInfo.ScanResult)
                } else if (message.Event === 'pic_sysphoto') {
                    console.log('系统拍照： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
                } else if (message.Event === 'pic_photo_or_album') {
                    console.log('拍照或者相册： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
                } else if (message.Event === 'pic_weixin') {
                    console.log('微信相册发图： ' + message.SendPicsInfo.count + ' ' + JSON.stringify(message.SendPicsInfo.PicList))
                } else if (message.Event === 'location_select') {
                    console.log('地理位置： ' + JSON.stringify(message.SendLocationInfo))
                } else if (message.MsgType === 'text') { // 用户文本输入
                    let content = message.Content
                    reply = content + '太复杂了，无法解析';
                    if (content === '1') {
                        reply = '1'
                    } else if (content === '2') {
                        reply = [{
                            title: '2',
                            description: '2',
                            picUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                            url: 'http://xccjh.gz2vip.91tunnel.com/static/'
                        }]
                    }
                }
                const xml = util.tpl(reply, message)
                res.send(xml);
            }
        }
    }
)

//接口测试
app.get("/test", function (req, res) { //获取配置
    res.send(JSON.stringify({code: 0, msg: "成功"}));
});

server.on("listening", onListening);

function onListening() {
    console.log(`server port ${port} listening and open browser with http://localhost:${port}....`);
    //opn(`http://localhost:${port}`,"chrome");
}

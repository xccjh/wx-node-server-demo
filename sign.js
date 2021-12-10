var sha1 = require('sha1')

/**
 * 随机数
 * @param len
 * @returns {string}
 */
function randomString (len) {
  len = len || 32
  var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
  /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  var maxPos = $chars.length
  var pwd = ''
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos))
  }
  return pwd
}

var createNonceStr = function () {
	return randomString(16);
};

var createTimestamp = function () {
	return parseInt(new Date().getTime() / 1000) + "";
};

var raw = function (args) {
	var keys = Object.keys(args);
	keys = keys.sort();
	var newArgs = {};
	keys.forEach(function (key) {
		newArgs[key.toLowerCase()] = args[key];
	});

	var string = "";
	for (var k in newArgs) {
		string += "&" + k + "=" + newArgs[k];
	}
	string = string.substr(1);
	return string;
};

/**
* 签名算法
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*/
var sign = function (jsapi_ticket, url) {
    const nonceStr = createNonceStr()
    const timestamp = createTimestamp()
   var string = 'jsapi_ticket=' + jsapi_ticket + '&noncestr=' + nonceStr + '&timestamp=' + timestamp + '&url=' + url
   var signature = sha1(string)

	return {
        jsapi_ticket,
        url,
        signature,
        timestamp,
        nonceStr
    };
};

module.exports = sign;

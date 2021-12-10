const axios = require('axios');
const Base64 = require("js-base64").Base64;
const sign = require("./sign.js");
const base = {
    appid: "wx8205f216ec0607a7", //公众号的appid
    secret: "a7dedd16ff6accf915093d128f3be258", //公众号的secret
    wxapi: "https://api.weixin.qq.com/cgi-bin" //接口前缀
};

/**
 * 根据appid,secret获取access_token
 */
function getAccessToken() {
    return axios.get(`${base.wxapi}/token?grant_type=client_credential&appid=${base.appid}&secret=${base.secret}`);
}

/**
 * 根据access_token获取ticket(jssdk用)
 */
function getTicket(access_token) {
    return axios.post(`${base.wxapi}/ticket/getticket?access_token=${access_token}&type=jsapi`);
}

/**
 * 根据access_token获取ticket(场景值用)
 * 返回ticket拼接https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=给image标签即为一张图片
 */
function getErWeiMaTicket(access_token) {
    return axios.post(`${base.wxapi}/qrcode/create?access_token=${access_token}`,
        {
            "expire_seconds": 604800, // 临时二维码
            "action_name": "QR_SCENE",
            "action_info": {"scene": {"scene_id": 123}} // 自定义场景值
        })
}


/**
 * 根据ticket和url通过加密返回所有jssdk需要的左所有config数据
 * @see https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html#1
 * @param  {String} href  需要sdk授权的url页面
 * @return {Object} config  sdk授权需要的所有参数
 */
async function getConfigData(href) {
    let configData;
    try {
        const accessTokenData = await getAccessToken();
        const ticketData = await getTicket(accessTokenData.data.access_token);
        const decodeHref = Base64.decode(href);
        configData = sign(ticketData.data.ticket, decodeHref);
        configData.appid = base.appid;
    } catch (err) {
        //打印错误日志
        console.log(err);
        configData = {};
    }
    return configData;
}

/**
 * 获取场景值二维码的ticket返回给前端
 * @see https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html
 * @returns {Promise<AxiosResponse<{
 *     ticket:string, // 获取的二维码ticket，凭借此ticket可以在有效时间内换取二维码。
 *     expire_seconds:number, // 该二维码有效时间，以秒为单位。 最大不超过2592000（即30天）。
 *     url:stri // 二维码图片解析后的地址，开发者可根据该地址自行生成需要的二维码图片
 * }>>}
 */
async function getErWeMaData() {
    const accessTokenData = await getAccessToken();
    const erWWeMaData = await getErWeiMaTicket(accessTokenData.data.access_token);
    return erWWeMaData;
}

module.exports = {
    getErWeMaData,
    getConfigData
};

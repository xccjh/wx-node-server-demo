<template>
  <div>
    分享测试
    <button @click='openCamera'>打开本机相册</button>
    <button @click='scan'>扫一扫</button>
    <button @click='address'>定位</button>
  </div>
</template>

<script lang='js'>
  import axios from 'axios'
  const Base64 = require("js-base64").Base64;
  const requestInstall = axios.create({
    // A.公共接口
    baseURL: '/api',
    // B.设置接口请求超时
    timeout: 6 * 1000
  })
  export default {
    name: 'App',
    components: {},
    methods: {
      openCamera() {
        window.wx.chooseImage({
          count: 1, // 默认9
          sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success: function () {
          }
        });
      },
      scan() {
        window.wx.scanQRCode({
          needResult: 0, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ["qrCode", "barCode"], // 可以指定扫二维码还是一维码，默认二者都有
          success: function () {
          }
        });
      },
      address() {
        window.wx.getLocation({
          type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {
            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            window.wx.openLocation({
              latitude: latitude, // 纬度，浮点数，范围为90 ~ -90
              longitude: longitude, // 经度，浮点数，范围为180 ~ -180。
              name: '广州市区', // 位置名
              address: '新港东路', // 地址详情说明
              scale: 26, // 地图缩放级别,整型值,范围从1~28。默认为最大
              infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
            });
          }
        });
      }
    },
    setup() {
      // 展示带场景值二维码
      requestInstall.get('/erweima').then(res => {
        var myImage = document.createElement("img");
        myImage.src = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${encodeURIComponent(res.data.ticket)}`;
        myImage.width = 200;
        myImage.height = 200;
        document.body.appendChild(myImage);
      })
      // 获取sdk授权配置
      requestInstall.get('/configdata?href=' + Base64.encode(window.location.href))
              .then(res => {
                window.wx.config({
                  debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                  appId: res.data.appid, // 必填，公众号的唯一标识
                  timestamp: res.data.timestamp, // 必填，生成签名的时间戳
                  nonceStr: res.data.nonceStr, // 必填，生成签名的随机串
                  signature: res.data.signature,// 必填，签名
                  jsApiList: [
                    'chooseImage',
                    'updateAppMessageShareData',
                    'updateTimelineShareData',
                    'onMenuShareAppMessage',
                    'onMenuShareTimeline',
                    'scanQRCode',
                    'openLocation',
                    'getLocation',
                  ] // 必填，需要使用的JS接口列表
                });

                window.wx.ready(function () {
                  window.wx.onMenuShareAppMessage({
                    title: '这是一个测试的标题',
                    desc: '这是一个测试的描述',
                    link: 'http://xccjh.gz2vip.91tunnel.com/static/',
                    imgUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                    success: function (res) {
                      console.log(res);
                      // 用户确认分享后执行的回调函数
                    },
                    cancel: function (res) {
                      console.log(res);
                      // 用户取消分享后执行的回调函数
                    }
                  });
                  window.wx.onMenuShareTimeline({
                    title: '这是一个测试的标题',
                    link: 'http://xccjh.gz2vip.91tunnel.com/static/',
                    imgUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                    success: function (res) {
                      console.log(res)
                      // 用户确认分享后执行的回调函数
                    },
                    cancel: function (res) {
                      console.log(res);
                      // 用户取消分享后执行的回调函数
                    }
                  });
                  window.wx.updateAppMessageShareData({
                    title: '这是一个测试的标题',
                    desc: '这是一个测试的描述',
                    link: 'http://xccjh.gz2vip.91tunnel.com/static/',
                    imgUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                    success: function (res) {
                      console.log(res)
                      // 用户确认分享后执行的回调函数
                    },
                    cancel: function (res) {
                      console.log(res)
                      // 用户取消分享后执行的回调函数
                    }
                  });
                  window.wx.updateTimelineShareData({
                    title: '这是一个测试的标题',
                    link: 'http://xccjh.gz2vip.91tunnel.com/static/',
                    imgUrl: 'https://avatar.csdn.net/E/B/6/1_frankcheng5143.jpg',
                    success: function (res) {
                      console.log(res)
                      // 用户确认分享后执行的回调函数
                    },
                    cancel: function (res) {
                      console.log(res);
                      // 用户取消分享后执行的回调函数
                    },
                  });
                  // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                });
                window.wx.error(function (res) {
                  alert(JSON.stringify(res))
                  // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                });
              })

      return {}
    }
  }
</script>

<style>

</style>

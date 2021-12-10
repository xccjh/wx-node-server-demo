## nodejs对接微信公众号

1. 对接微信服务器
2. 生成场景值二维码引流服务号（关注、未关注）
3. 对接微信sdk配置，进而配置图文分享链接，扫一扫，拍照/系统相册，地理定位

![](https://xccjhzjh.oss-cn-hongkong.aliyuncs.com/xccjh-images/wx.jpg)

## 仓库

[gitee地址](https://github.com/leinov/node-weixin-api)

## 使用

```
git clone https://gitee.com/xccjh/wx-node-server-demo.git
npm install
npm start
```

## 目录

```
    |-- dist // 前端编译生产目录，使用sdk的h5页面
    |-- node_modules
    |-- sign.js //公众号文档提供签名算法
    |-- wx.js //获取签名数据文件
    |-- tpl.js // json转xml相关
    |-- sign.js // 签名相关
    |-- www.js // 启动对接公众号服务端
    |-- package.json
    |-- .gitignore
```

## 关于微信使用sdk功能的限制和sdk配置图文分享

1. 用户访问h5网页想要使用sdk必须关注对应服务号，sdk和服务号appid关联，否则err可以捕获到没有权限
2. 用户可以在别人分享出去的图文链接长按转发实现图文二次转发,进到图文链接后如果有关注也可右上角分享出图文，其他不行
3. 使用sdk配置后的链接要在服务号窗口内点击才可在进去网页后的右上角分享到朋友、圈配置链接图文（这是图文链接的生成源头）
4. 在微信内h5地址如果是纯地址不在服务号窗口内点击访问不能实现链接图文配置，不管有没关注

总结，关注用户在服务号窗口内点击地址链接(可以用户输入进去或服务端推送)进入h5网页通过右上角...分享才可以配置图文分享，一旦分享出图文链接，二次转发都可实现图文分享转发

### 对应解决方案：

二维码换成带uuid场景值的微信二维码，用户扫码后引导用户到服务号

1. 如果用户还未关注公众号，跳到服务号关注页，关注后微信会将带场景值关注事件和关注用户openid推送给我们服务器，服务端共根据uuid和用户openid推送给对应用户图文或链接

2. 如果用户已经关注公众号，在用户扫描后会自动进入会话，微信也会将带场景值扫描事件推送给我们服务器，同理推送用户即可

### 相关技术实现：

1. [生成二维码](https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html)
2. [接收关注事件推送](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html)
3. [回复用户消息](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html#%E5%9B%9E%E5%A4%8D%E5%9B%BE%E6%96%87%E6%B6%88%E6%81%AF)


## 最后

[微信公众号开发文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)

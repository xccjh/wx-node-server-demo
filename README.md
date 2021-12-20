## nodejs对接微信公众号

1. 对接微信服务器
2. 生成场景值二维码引流服务号（关注、未关注）
3. 对接微信sdk配置，进而配置图文分享链接，扫一扫，拍照/系统相册，地理定位
4. 和微信服务器的所有交互监听，比如你问我答，扫码，(取消)订阅监听等

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
    |-- windows-sunny-ngrok // 外网穿透
    |-- front // vue3前端逻辑 
    |-- package.json
    |-- .gitignore
```

## 关于微信使用sdk功能的限制和sdk配置图文分享

1. 用户访问h5网页想要使用sdk必须关注对应服务号，sdk和服务号appid关联(这也是为什么类似餐饮扫码之后要走关注的原因)，否则err可以捕获到没有权限
2. 用户可以在别人分享出去的图文链接(重点是已经是图文链接了)长按转发实现图文二次转发,进到图文链接后如果有关注(重点是有关注)也可右上角分享出图文，其他不行
3. 使用sdk配置后的链接要在服务号窗口内(重点是窗口内)点击才可在进去网页后的右上角分享到朋友、圈配置链接图文（这是图文链接的生成源头）
4. 在微信内h5地址如果是纯地址(注意是纯地址链接)不在服务号窗口内点击访问不能实现链接图文配置，在h5用了jsSdk的情况下且已经关注服务号的情况下也不行

总结，关注用户(为了能用jsSdk)在服务号窗口内点击(必须这样)地址链接(可以用户输入进去或服务端推送)进入h5网页通过右上角...分享才可以配置图文分享，一旦分享出图文链接，二次转发都可实现图文分享转发(二次分享未关注用户也可以在外面长按转发实现图文分享)

tips: 
1. 有时候由于用户在其他地方点击了纯地址链接导致在服务号内点击纯地址链接分享也不能分享出图文链接，刷新也不行，退出微信也不行，可以通过在地址后面加上查询字符串来刷新缓存，注意是hash前的，比如`http://baidu.com/?aa=bb#qq`，改成`http://baidu.com?aa=bb&xxx#qq`即可

2. 有时候发现使用了jssdk不生效的情况，请检查onMenuShareAppMessage和onMenuShareTimeline的参数不能多传，此外格式如地址要正确以http开头，另外图文的图地址base64是不支持的。

3. 图文调试在公众号的在线测试工具的类型是：消息接口调试=> 链接消息，其中 MsgId 是随便填写的

### 对应解决方案：

二维码换成带uuid场景值的微信二维码，用户扫码后引导用户到服务号

1. 如果用户还未关注公众号，跳到服务号关注页，关注后微信服务器会将带场景值关注事件和关注用户openid推送给我们服务器，我们服务器可以根据微信服务器回调的业务uuid和用户openid再回复微信服务器实现推送给对应用户图文或链接

2. 如果用户已经关注公众号，在用户扫描后会自动进入会话，微信服务器也会将带场景值扫描事件推送给我们服务器，同理推送用户即可

总结一句话，餐饮那种扫码下单：扫码-》关注-》发卡片消息-》用户点开卡片-》继续分享出卡片

### 相关技术实现：

1. [生成二维码](https://developers.weixin.qq.com/doc/offiaccount/Account_Management/Generating_a_Parametric_QR_Code.html)
2. [接收关注事件推送](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Receiving_event_pushes.html)
3. [回复用户消息](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html#%E5%9B%9E%E5%A4%8D%E5%9B%BE%E6%96%87%E6%B6%88%E6%81%AF)

## 一些概念和信息：
1. ip白名单：获取能使用微信开发接口全局票据access_token的我们服务器的ip地址。
2. js安全域名或目录：不带协议不需要https或icp备案，能使用jsSdk的服务号对接的h5域名，第三方域名h5临时auth2授权想要获取使用jsSdk的权限需要填写域名在这里，不要以http(s)开头，格式类似`xccjh.gz2vip.91tunnel.com`。
3. 业务域名或目录：不带协议，必须icp备案,不写出现安全提示，会重新排版。
4. 授权回调域名:不带协议和端口,auth2授权只是为了拿到用户的信息（如openid：用户微信号加密后的值，每个服务号每个用户唯一）进行下一步的业务和jsSdk的使用没有关系，需要到微信服务号接口权限表处填写允许auth2授权的第三方域名才能进行auth授权，测试号回调地址支持域名和ip，正式服务号回调地址只支持域名。sdk的配置要每个网页地址调用一次
网页授权，获取sdk签名配置跟自己服务端和微信服务器对接没有关系，填写js安全域名即可，即通过前端本地域名回环即可使用本机后端服务和前端服务代理打通对接微信服务器
  - 在微信公众号请求用户网页授权之前，开发者需要先到公众平台官网中的“开发 - 接口权限 - 网页服务 - 网页帐号 - 网页授权获取用户基本信息”的配置选项中，修改授权回调域名。请注意，这里填写的是域名（是一个字符串），而不是URL，因此请勿加 http:// 等协议头；
  - 授权回调域名配置规范为全域名，比如需要网页授权的域名为：www.qq.com，配置以后此域名下面的页面http://www.qq.com/music.html 、 http://www.qq.com/login.html 都可以进行OAuth2.0鉴权。但http://pay.qq.com 、 http://music.qq.com 、 http://qq.com 无法进行OAuth2.0鉴权
  - 对于以snsapi_base为scope的网页授权，就静默授权的，用户无感知；对于已关注公众号的用户，如果用户从公众号的会话或者自定义菜单进入本公众号的网页授权页，即使是scope为snsapi_userinfo，也是静默授权。
5. 注意公众号后台添加运营号和开发者号的区别

6. 服务器配置：
  - URL是我们服务器提供的一个接口，和微信服务器进行对接以确定对接成功，以http开头，测试号不需要是https，其实就是我们服务器的一个get请求接口，比如`http://xccjh.gz2vip.91tunnel.com/auth`。
  - token是我们自己可以随便定义的，用来唯一加密和微信服务器进行通讯对接，比如xccjh。
7. EncodingAESKey：我们服务器与微信服务器通讯信息加密用，是我们自己可以随便定义的，比如xccjh。

8. 测试号的申请和个人微信号关联，一个微信号一个测试号，在帮助文档搜索测试号进入入口扫码申请，测试号的管理后台就是扫码后进去的页面。
9. 测试号对接不需要https,域名也不需要备案，如果想要https，使用的自定义域名必须经过备案，否则自动跳转到工信部备案的页面。

10. ngrok.cc提供的外网穿透服务得到的域名不能获取到ssl证书，因为免费或付费申请ssl证书需要在域名dns映射管理端添加text记录。
11. 个人购买的顶级域名可以自定义添加子级域名，每个子级或顶级域名都可以自定义诸多cname，text等记录。

12. 同一个服务号不同用户看到不同菜单是通过个性化菜单实现，请求微信开发接口配置菜单增加匹配规则，一般是通过给用户打标签来实现。
13. 用户回复服务号，出现类似“该公众号提供的服务出现故障”之类是因为我们服务端端的接口没有回应在URL(即我们服务器配置=>URL确认对接微信服务器的接口)这个接口下的post请求各种msgType(文本，图片，语音，视频，事件比如扫码，地理位置上报等)返回给微信服务器的xml格式数据以回复用户导致，即我们想回复服务号用户信息通过URL接口下判断各种msgType返回对应xml格式数据给微信服务器即可，而确认对接(url点保存能成功)是来自微信服务器的get请求。

14. 区分网页授权access_token和普通access_token，jsSdk用的ticket和场景二维码ticket
  - 全局access_token=> appid + secret => access_token
  - jsSdk配置=> 全局access_token => ticket => signature
  - 场景值二维码=>  全局access_token => ticket => `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=TICKET`就是一张图片地址（TICKET进行encodeURIComponent）
  - 网页授权access_token=> 引导用户进入授权页面同意授权，获取code => 通过code换取网页授权access_token（与基础支持中的access_token不同）和openid=> 如果需要，开发者可以刷新网页授权access_token，避免过期 => 通过网页授权access_token和openid获取用户基本信息（支持UnionID机制）
  
15. 认证帐号可以对实时调用量清零,每月共10次清零操作机会。其他情况当超过一定限制时，调用对应接口会收到如下错误返回码：`{"errcode":45009,"errmsg":"api freq out of limit"}`
  - 获取access_token限额2000/天，自定义菜单创建限额1000/天,获取带参数的二维码限额100000/天，获取网页授权access_token和获取用户信息无限制。
  - 注意测试号获取access_token限额200/天，自定义菜单创建限额100/天,获取带参数的二维码10000/天,获取网页授权access_token和获取用户信息无限制。
  
16. 注意微信开放接口测试地址和jssdk签名计算测试地址的不同。

17. 注意各种认证非认证服务号公众号区别，所有公众号、服务号认证都需要300元费用，一次认证可以关联小程序。

18. 注意启动80端口要使用管理员权限，代理changeOrign的含义以及devServer的host的使用实现本机前端网页授权域名对接和代理配置。
19. 注意sdk可以使用node包，如何手动实现签名参数排序，createhash库可以实现sha1，服务端key值共享，缓存过期设定，服务端实现重定向获取授权等
20. 关于票据失效问题可以通过cookie失效机制实现用户重新授权或者服务端实现token和ticket失效刷新。

21. 一般公众号主要入口有：公众号设置的功能设置，人员设置，开发者工具，基本配置四个
22. 一般小程序主要入口有: 版本管理，成员管理，开发管理中的开发设置，微信支付，设置五个。其中微信支付认证和小程序认证是分开认证的。
23. 小程序接口必须是https的，开发工具可以开启不检查，同时可以开启使用npm包等。

## 最后

[微信公众号开发文档](https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1421140842)


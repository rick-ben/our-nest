# 我们的小窝

> 创建一个只属于我们的专属小窝微信小程序，在这里可以发动态，也可以作为一个云端的相册，将我们之间的美好瞬间全都记录下来。开源代码免费提供，但是不允许商用目的！
>
> 个人主体小程序可通过

## 功能体验

![微信扫码体验](./miniprogram/static/images/Qrcode.jpg)

## 公众号

![笔笔赚营地](./miniprogram/static/images/Qrcode2.jpg)

## 功能简述

- [x] 小程序完美适配暗黑模式（跟随手机自动切换）
- [x] 整体基础框架已支持自定义API请求
- [x] 首页栏目
- [x] 访客仅能看最近20条动态（保护隐私）
- [x] 长按首页左上角小窝进入发文字动态
- [x] 点按首页左上角小窝进入发图文动态
- [x] 发动态时需选取当前位置
- [x] 动态详情页
- [x] 动态详情可分享到朋友圈（仅Android支持）
- [x] 相册栏目
- [x] 访客只能查看公开相册（保护隐私）
- [x] 访客只能查看公开相册内的最近20个照片或视频（保护隐私）
- [x] 相册可设置成员（成员只能查看、不能上传和修改配置）
- [x] 动态图片有一个专门的相册保存，归属人可以删除里面的图片，但是请谨慎删除（删除后动态图文中会显示异常，建议删除没有用到的图片）
- [x] 个人中心栏目
- [x] 程序异常时，用户可自行清除小程序缓存
- [x] 可通过退出小程序来关闭当前小程序窗口
- [x] 点击右上角资料图标可设置头像和手机号
- [x] 系统关键数据通过手机号来绑定
- [x] 发布文章提醒（付费）
- [x] 评论文章提醒（付费）



## 部署教程

1. 使用Git拉取/下载本项目到本地
2. 打开微信开发者工具
3. 打开本项目
4. 请按教程步骤先配置完再预览体验，不然是体验不到的

### 添加配置文件

1. 在`miniprogram`目录下，新建`config`目录
2. 在`config`目录下新建`base_config.js`和`request_config.js`文件

### 修改配置文件

#### base_config.js

```javascript
/**
 * 项目基础配置
 */
module.exports = {
  // 需要在本地调试时访问体验服务器资源则开启,开启后请求时会自动请求到"request_trial"地址
  "trial_test": true,
  // 请求api配置,非必填（如果有自己的业务则可以用）
  "request_develop": "http://api.xxx.com",//本地开发
  "request_trial": "https://api.xxx.com",//测试环境
  "request_release": "https://api.xxx.com",//线上环境
  // 云开发环境id配置（位置：云开发控制台->环境id，如果只有一个环境，则三个都填一样的）
  "wx_cloud_env_develop": "xxxxxxx",//本地开发
  "wx_cloud_env_trial": "xxxxxxx",//测试环境
  "wx_cloud_env_release": "xxxxxxx",//线上环境
  // 小窝应用信息（用于提醒服务，发布文章，评论文章时提醒，如需开通请联系：jidekf）
  // 提醒服务收费标准：邮件提醒（0.04/次），短信提醒(0.08/次)，公众号提醒（0.1/次，不支持直接打开）
  "nest_app_id": "",
  "nest_app_key": ""
};
```

#### request_config.js

```javascript
const base = require('./base_config');

/**
 * 获取请求地址
 */
export function getApiBaseUrl() {
  switch (__wxConfig.envVersion) {
    case 'develop':
      if (base.trial_test) {
        return base.request_trial;
      } else {
        return base.request_develop;
      }
    case 'trial':
      return base.request_trial;

    case 'release':
      return base.request_release;

    default:
      return base.request_develop;
  }
}

/**
 * 获取微信云开发环境ID
 */
export function getWxCloudEnv() {
  switch (__wxConfig.envVersion) {
    case 'develop':
      if (base.trial_test) {
        return base.wx_cloud_env_trial;
      } else {
        return base.wx_cloud_env_develop;
      }
    case 'trial':
      return base.wx_cloud_env_trial;

    case 'release':
      return base.wx_cloud_env_release;

    default:
      return base.wx_cloud_env_develop;
  }
}
```



### 配置云开发环境

1. 打开微信开发者工具
2. 左上角找到云开发按钮
3. 进入云开发，创建按量计费环境（10人以下少量使用一个月大概1块钱，后期照片视频等上传的多了可能会增加，但是还是比自己的服务器便宜）
4. 记得预存几块钱到当前小程序账号下（在云开发控制台->概览->充值与账单）

#### 创建云数据库

1. 打开云开发控制台

2. 选择数据库菜单项

3. 添加以下集合、`article`、`photoAlbum`、`photos`、`users`、`articleComment`

4. 设置集合权限（位置在集合->数据权限）

   `article`=自定义安全规则

   ```json
   {
     "read": true,
     "write": "doc._openid == auth.openid"
   }
   ```

   photoAlbum=所有用户可读，仅创建者可读写

   photos=所有用户可读，仅创建者可读写

   users=自定义安全规则

   ```json
   {
     "read": true,
     "write": "doc._openid == auth.openid"
   }
   ```
   
   articleComment=所有用户可读，仅创建者可读写

#### 安装云开发依赖

1. 在`cloudfunctions\nestFunctions`目录下打开终端

2. 执行以下命令

   ```shell
   npm install --save wx-server-sdk@latest
   ```

#### 数据表说明

##### users

```
auth_deploy : "bool值，表示是否可以发布文章，为false时表示当前用户为游客"
auth_photo : "bool值，表示是否可以创建相册，为false时表示当前用户为游客"
auth_view : "bool值，表示是否可以查看所有数据，为false时表示当前用户为游客，所有内容只能查看20条记录"
auth_notice : "bool值，表示是否可以接收通知，为false时表示不接收"
```



#### 配置环境权限（分享朋友圈需要）

1. 打开云开发控制台
2. 选择 设置
3. 权限设置tab
4. 未登录用户访问云资源权限设置->未登录用户访问权限开启

#### 部署云开发云函数

1. 打开微信开发者工具
2. 找到编辑器目录
3. 找到`cloudfunctions/nestFunctions`目录，选中目录并右键，点击`创建并部署：（所有文件/云端安装依赖）`

### 消息提醒服务

提醒新文章发布、新评论，如需开通请联系：jidekf
收费标准：邮件提醒（0.04/次），短信提醒(0.08/次)，公众号提醒（0.1/次，不支持直接打开）

扣费标准：预付费模式。提醒一个人扣一次费，不成功不扣费

#### 邮件提醒

1. 联系开通
2. 在`users`表中手动设置`email`字段（没有则添加），或上线后在个人中心中设置
3. 已经在使用的设置后，需要在个人中心清除缓存再重启小程序使用

#### 短信提醒

1. 联系开通
2. 在`users`表中手动设置`phone`字段，或上线后在个人中心中设置
3. 已经在使用的设置后，需要在个人中心清除缓存再重启小程序使用

#### 公众号提醒

1. 联系开通
2. 关注“笔笔赚营地”公众号，上面有二维码
3. 在聊天窗口回复`openid`，系统会自动回复你在本公众号的`openid`
4. 在`users`表中手动设置`mp_openid`字段的值为上一步获取到的`openid`，没有则添加
5. 已经在使用的设置后，需要在个人中心清除缓存再重启小程序使用

### 初级教程结束

至此，小程序就可以上传发布使用了！有问题请加微信：`jidekf`

> 注意：部署后请在个人中心设置自己的手机号，并到`users`数据库中修改你自己这条记录的权限，加入的成员均需要手动配置！

## 打赏

请我喝杯奶茶？

| ![](./miniprogram/static/images/zhifubao.jpg) | ![](./miniprogram/static/images/weixin.jpg) |
| ------------------------------------------- | ----------------------------------------- |


# 情侣小窝 — 微信云开发版安装部署教程

> 本教程将引导你从零开始部署情侣小窝微信小程序。

---

## 部署前准备

在开始部署之前，请确保你已经：

1. 注册了[微信小程序账号](https://mp.weixin.qq.com/)
2. 下载并安装了[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
3. 获取了情侣小窝项目源码（见下方代码获取）

## 代码获取

从以下任意平台获取项目源码：

- **Gitee**：[https://gitee.com/regaing/our-nest](https://gitee.com/regaing/our-nest)
- **GitHub**：[https://github.com/rick-ben/our-nest](https://github.com/rick-ben/our-nest)

## 依赖说明

本项目使用微信自带的 **WeUI** 组件库，无需额外安装前端依赖。

- 前端组件：weui
- 文档地址：[https://wechat-miniprogram.github.io/weui/docs/](https://wechat-miniprogram.github.io/weui/docs/)

---

## 部署步骤概览

1. 使用 Git 拉取 / 下载本项目到本地
2. 打开微信开发者工具
3. 导入本项目
4. 按照以下步骤依次配置
5. 预览并上传发布

> **注意**：请务必按照教程步骤先完成配置再预览体验，否则将无法正常使用。

---

## 第一步：配置云开发环境

### 1.1 创建云开发环境

1. 打开微信开发者工具
2. 点击左上角「云开发」按钮
3. 进入云开发控制台，创建一个**按量付费**环境
4. 创建完成后，在云开发概览页复制**环境 ID**

### 1.2 修改配置文件

配置文件位置：`miniprogram/config/` 目录下

#### `base_config.js`

将上一步复制的环境 ID 填入对应位置：

```javascript
// 云开发环境id配置（位置：云开发控制台->环境id）
// 如果只有一个环境，三个都填一样的
"wx_cloud_env_develop": "xxxxxxx",  // 本地开发
"wx_cloud_env_trial": "xxxxxxx",    // 测试环境
"wx_cloud_env_release": "xxxxxxx",  // 线上环境
```

---

## 第二步：安装云开发依赖

1. 确保已安装 Node.js 和 npm（未安装的请先[安装 Node.js](https://nodejs.org/)）
2. 在 `cloudfunctions/nestFunctions` 目录下打开终端
3. 执行以下命令：

```shell
npm install --save wx-server-sdk@latest
```

如果安装失败，可使用淘宝镜像：

```shell
npm install --save wx-server-sdk@latest --registry=https://registry.npm.taobao.org
```

---

## 第三步：部署云函数

1. 打开微信开发者工具
2. 在编辑器目录中找到 `cloudfunctions/nestFunctions` 目录
3. 选中 `cloudfunctions` 目录 → 右键 → 选择当前云环境
   - 如果环境没有显示出来，重启开发工具或多刷新几次
4. 选中 `nestFunctions` 目录 → 右键 → 选择「**创建并部署：云端安装依赖**」

---

## 第四步：创建云数据库

### 4.1 创建集合

进入云开发控制台 → 数据库，添加以下集合：

| 集合名称 | 用途说明 |
|----------|----------|
| `article` | 文章/动态数据 |
| `photoAlbum` | 相册数据 |
| `photos` | 照片数据 |
| `users` | 用户数据 |
| `articleComment` | 评论数据 |
| `configLoversBase` | 基础配置（纪念日等） |

### 4.2 设置集合权限

在集合页面 → 数据权限 → 为每个集合设置合适的权限：

**article 集合** — 自定义安全规则：

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**photoAlbum 集合** — 所有用户可读，仅创建者可读写

**photos 集合** — 所有用户可读，仅创建者可读写

**users 集合** — 自定义安全规则：

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**articleComment 集合** — 所有用户可读，仅创建者可读写

**configLoversBase 集合** — 自定义安全规则：

```json
{
  "read": true,
  "write": true
}
```

---

## 第五步：添加基础数据

### 集合：`configLoversBase`

按照以下格式新增一条数据：

| 键 | 类型 | 值 | 说明 |
|----|------|-----|------|
| `flag` | number | `1` | 标识位 |
| `start_time` | date | 按你的时间填写 | 恋爱开始日期 |
| `desc` | string | 相恋日 | 描述文字 |

---

## 第六步：数据表说明

### users 表 — 用户权限管理

为保证安全，用户的权限需要手动在数据库中修改。在 `users` 表中，每个用户拥有以下权限字段：

```json
{
  "auth_deploy": "bool，是否可以发布文章，为 false 时表示当前用户为游客",
  "auth_photo": "bool，是否可以创建相册，为 false 时表示当前用户为游客",
  "auth_view": "bool，是否可以查看所有数据，为 false 时所有内容只能查看20条",
  "auth_notice": "bool，是否可以接收通知"
}
```

> **注意**：修改权限后需要清除小程序缓存才能生效。

### 成员如何加入

让对方进入小程序后，系统会自动为其创建一条用户数据。之后在小程序后台的 `users` 表中修改该用户的权限即可。

---

## 第七步：环境权限配置

若需要支持**分享到朋友圈**功能：

1. 打开云开发控制台
2. 选择「设置」
3. 进入「权限设置」标签
4. 找到「未登录用户访问云资源权限设置」→ 开启**未登录用户访问权限**

---

## 第八步：性能优化

### 建立数据库索引

在微信开发者工具中开启调试器，将所有页面逐一访问一遍。调试器会提示需要建立的索引，按照提示建立即可，加载速度会有明显提升。

---

## 常见问题

### 如何发布记录？

在首页点击或长按左上角「小窝」文本，即可进入发布页面。如果没有进入，请检查用户权限设置。

### 小程序隐私保护指引

开发者收集用户选中的照片或视频信息，仅用于相册展示功能。

---

## 部署完成

至此，小程序已经可以上传发布使用了！

部署后请在个人中心设置手机号，并到 `users` 数据库中修改对应记录的权限。**所有加入的成员均需手动配置权限**。

---

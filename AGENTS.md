# 情侣小窝 (Our Nest)

微信云开发小程序 —— 情侣专属的私密空间，支持动态发布、相册共享、纪念日记录。

## 技术栈

| 项 | 说明 |
|---|---|
| 类型 | 微信小程序 (原生框架) |
| 后端 | 微信云开发 CloudBase（云函数 + 云数据库 + 云存储） |
| UI 组件 | WeUI 扩展库 |
| 语言 | JavaScript (ES6) |
| 云函数 | Node.js + wx-server-sdk |
| 基础库 | 2.24.7+ |

## 目录结构

```
├── miniprogram/               # 小程序前端
│   ├── pages/                 # 主包页面
│   │   ├── home/              # 首页（动态流）
│   │   ├── album/             # 相册
│   │   ├── personal/          # 我的
│   │   └── install/           # 安装引导页
│   ├── model-article/         # 文章分包（发布/详情）
│   ├── model-common/          # 通用分包（设置/纪念日）
│   ├── model-album/           # 相册分包（详情/设置）
│   ├── components/            # 公共组件（cm-nav, cm-select-members）
│   ├── config/                # 配置文件（base_config, request_config）
│   ├── service/               # HTTP 服务层
│   ├── mixin/common.js        # 页面通用混入（权限、主题、初始化）
│   ├── libs/Mixins.js         # 自定义 mixin 系统
│   ├── utils/                 # 工具函数（util.js, tools.wxs）
│   └── static/                # 静态资源
├── cloudfunctions/nestFunctions/  # 云函数（单一入口，按 type 路由）
│   ├── index.js               # 入口：getOpenId / getUserInfo / addPhotos / delPhotos / getAnniversary
│   └── package.json           # 依赖：wx-server-sdk
└── project.config.json        # 微信开发者工具配置
```

## 数据库集合

| 集合 | 用途 |
|---|---|
| `article` | 动态/文章 |
| `articleComment` | 评论 |
| `photoAlbum` | 相册 |
| `photos` | 照片 |
| `users` | 用户（含权限字段） |
| `configLoversBase` | 基础配置（纪念日等） |

## 用户权限系统

users 集合中的权限字段：

- `auth_deploy` — 是否可以发布文章
- `auth_photo` — 是否可以创建相册
- `auth_view` — 是否可查看全部数据（否则游客限20条）
- `auth_notice` — 是否接收通知

> 权限需在云开发后台手动修改，修改后需清除缓存生效。

## 页面路由

**TabBar**: 动态 (`pages/home/index`) | 相册 (`pages/album/index`) | 我的 (`pages/personal/index`)

**其他页面**（分包）：
- 发布文章: `/model-article/pages/deploy/index`
- 文章详情: `/model-article/pages/detail/index`
- 用户设置: `/model-common/pages/user-setting/index`
- 纪念日: `/model-common/pages/anniversary/index`
- 相册详情: `/model-album/pages/detail/index`
- 相册设置: `/model-album/pages/setting/index`
- 安装引导: `/pages/install/index`

## 架构约定

- **Mixin 模式**：所有页面通过 `mixins: [require('../../mixin/common')]` 注入公共逻辑（用户信息、主题、版本判断）。页面需实现 `initSuccess()` 作为初始化完成回调。
- **云函数路由**：单一云函数 `nestFunctions`，通过 `event.type` 分发到子模块。
- **无前端构建**：原生小程序，无需 webpack/vite，直接在微信开发者工具中运行。
- **主题**：支持 light/dark 自动切换，通过 `app.watchThemeChange()` 监听。

## 开发注意事项

1. 环境 ID 在 `miniprogram/config/base_config.js` 中配置
2. 首次部署需参照 README.md 完成：云环境创建 → 云函数部署 → 数据库集合创建 → 权限配置 → 基础数据添加
3. 部署完成后应删除 `mixin/common.js` 第 87-90 行的安装引导跳转代码
4. `miniprogram/config/` 和 `cloudfunctions/nestFunctions/config.json` 不要提交敏感信息
5. 云函数进入 `cloudfunctions/nestFunctions/` 目录执行 `npm install`

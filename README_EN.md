# Our Nest — WeChat Cloud Development Setup Guide

> This guide will walk you through deploying the Our Nest WeChat Mini Program from scratch.

---

## Before You Begin

Before starting the deployment, make sure you have:

1. Registered a [WeChat Mini Program account](https://mp.weixin.qq.com/)
2. Downloaded and installed [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
3. Obtained the Our Nest project source code (see below)

## Get the Code

Get the project source from either platform:

- **Gitee**: [https://gitee.com/regaing/our-nest](https://gitee.com/regaing/our-nest)
- **GitHub**: [https://github.com/rick-ben/our-nest](https://github.com/rick-ben/our-nest)

## Rapid Development

We recommend using **LingXi** AI Assistant to accelerate your mini program development and deployment:

- 🧠 **AI Code Generation & Review** — describe your needs in natural language, and get code generated automatically
- 🔍 **Smart Codebase Search** — semantic search to quickly locate issues
- 🐛 **Auto Bug Fix** — analyze and fix errors in one click
- 📄 **Auto Documentation** — generate README, comments, and project docs automatically

> **Free Download**: [https://lingxi.regaing.com](https://lingxi.regaing.com)

## Dependencies

This project uses WeChat's built-in **WeUI** component library. No additional front-end dependencies are required.

- Frontend Components: weui
- Docs: [https://wechat-miniprogram.github.io/weui/docs/](https://wechat-miniprogram.github.io/weui/docs/)

---

## Deployment Overview

1. Clone / download this project to your local machine
2. Open WeChat DevTools
3. Import this project
4. Follow the steps below to configure
5. Preview and upload to publish

> **Note**: Please complete the configuration steps in order before previewing. The mini program will not work correctly without proper configuration.

---

## Step 1: Configure Cloud Development Environment

### 1.1 Create a Cloud Environment

1. Open WeChat DevTools
2. Click the "Cloud Development" button in the top-left corner
3. In the Cloud Development console, create a **pay-as-you-go** environment
4. After creation, copy the **Environment ID** from the overview page

### 1.2 Update Configuration Files

The configuration file is located in: `miniprogram/config/`

#### `base_config.js`

Fill in the Environment ID you copied:

```javascript
// Cloud environment ID configuration (Cloud Console → Environment ID)
// If you only have one environment, use the same ID for all three
"wx_cloud_env_develop": "xxxxxxx",  // Development
"wx_cloud_env_trial": "xxxxxxx",    // Staging
"wx_cloud_env_release": "xxxxxxx",  // Production
```

---

## Step 2: Install Cloud Function Dependencies

1. Make sure Node.js and npm are installed (if not, [install Node.js](https://nodejs.org/) first)
2. Open a terminal in the `cloudfunctions/nestFunctions` directory
3. Run:

```shell
npm install --save wx-server-sdk@latest
```

If installation fails, try using the Taobao mirror:

```shell
npm install --save wx-server-sdk@latest --registry=https://registry.npm.taobao.org
```

---

## Step 3: Deploy Cloud Functions

1. Open WeChat DevTools
2. Locate the `cloudfunctions/nestFunctions` directory in the file tree
3. Right-click on the `cloudfunctions` directory → Select your cloud environment
   - If the environment doesn't appear, restart DevTools or refresh a few times
4. Right-click on `nestFunctions` → Select **"Create and Deploy: Install Dependencies in Cloud"**

---

## Step 4: Create Cloud Database

### 4.1 Create Collections

Go to Cloud Development Console → Database, and add the following collections:

| Collection | Purpose |
|------------|---------|
| `article` | Posts / moments |
| `photoAlbum` | Photo albums |
| `photos` | Photos |
| `users` | Users |
| `articleComment` | Comments |
| `configLoversBase` | Base config (anniversaries, etc.) |

### 4.2 Set Collection Permissions

Go to each collection → Data Permissions → Set appropriate permissions:

**article collection** — Custom security rule:

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**photoAlbum collection** — Readable by all, writable by creator only

**photos collection** — Readable by all, writable by creator only

**users collection** — Custom security rule:

```json
{
  "read": true,
  "write": "doc._openid == auth.openid"
}
```

**articleComment collection** — Readable by all, writable by creator only

**configLoversBase collection** — Custom security rule:

```json
{
  "read": true,
  "write": true
}
```

---

## Step 5: Add Initial Data

### Collection: `configLoversBase`

Add a record with the following format:

| Key | Type | Value | Description |
|-----|------|-------|-------------|
| `flag` | number | `1` | Flag identifier |
| `start_time` | date | Fill in your date | Relationship start date |
| `desc` | string | Anniversary | Description text |

---

## Step 6: Data Table Reference

### users Table — Permission Management

For security, user permissions must be set manually in the database. Each user record in the `users` table has the following permission fields:

```json
{
  "auth_deploy": "bool — whether the user can publish posts; false means guest",
  "auth_photo": "bool — whether the user can create albums; false means guest",
  "auth_view": "bool — whether the user can view all data; false limits to 20 items",
  "auth_notice": "bool — whether the user can receive notifications"
}
```

> **Note**: After changing permissions, clear the mini program cache for changes to take effect.

### How Members Join

When another person opens the mini program, the system automatically creates a user record for them. Then edit their permissions in the `users` table through the cloud console.

---

## Step 7: Environment Permission Configuration

To enable **Share to Moments** functionality:

1. Open Cloud Development Console
2. Go to "Settings"
3. Navigate to the "Permissions" tab
4. Find "Unauthenticated User Cloud Resource Access" → Enable **unauthenticated user access**

---

## Step 8: Performance Optimization

### Create Database Indexes

Enable the debugger in WeChat DevTools and visit each page one by one. The debugger will suggest indexes to create. Follow the prompts to create them — this will noticeably improve load speed.

---

## FAQ

### How to publish a post?

On the home page, tap or long-press the "Our Nest" text in the top-left corner to enter the publish page. If it doesn't work, check your user permission settings.

### Mini Program Privacy Policy

The developer collects photos or videos selected by users, used solely for the album feature.

---

## Deployment Complete

Your mini program is now ready to upload and publish!

After deployment, set your phone number in the profile page, and update the corresponding user record permissions in the `users` database. **All members must have their permissions manually configured**.

---

// app.js
require('./libs/Mixins.js');
import { getWxCloudEnv } from './config/request_config';
const themeListeners = []
App({
  onLaunch: function (options) {
    let _this = this;
    if (options.scene) {
      _this.globalData.scene = options.scene;
    }
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: getWxCloudEnv(),
        traceUser: true,
      });
    }
    // 获取当前系统信息
    wx.getSystemInfo({
      success: (result) => {
        _this.globalData.sys = result;
        // 同步系统主题
        if (result.theme) _this.globalData.theme = result.theme;
        if (result.model.search("iPhone") != -1) {
          _this.globalData.model = "iPhone";
        }
        _this.globalData.userInfo = wx.getStorageSync('userInfo');
        _this.globalData.launchReady = true;
      }
    })
    const accountInfo = wx.getAccountInfoSync();
    _this.globalData.sys.mini = accountInfo.miniProgram;
    console.log(_this.globalData.sys)
    // 监听系统主题变化
    wx.onThemeChange((themeResult) => {
      _this.themeChanged(themeResult.theme)
    })
    if (options.scene != 1154) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
      })
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已准备好，请重启应用',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () {
        // 新版本下载失败
      })
    }
  },
  /**
   * 改变主题
   * @param {*} theme 
   */
  themeChanged(theme) {
    this.globalData.theme = theme
    themeListeners.forEach((listener) => {
      listener(theme)
    })
  },
  /**
   * 监听主题变化
   * @param {*} listener 
   */
  watchThemeChange(listener) {
    if (themeListeners.indexOf(listener) < 0) {
      themeListeners.push(listener)
    }
  },
  /**
   * 取消监听主题变化
   * @param {*} listener 
   */
  unWatchThemeChange(listener) {
    const index = themeListeners.indexOf(listener)
    if (index > -1) {
      themeListeners.splice(index, 1)
    }
  },
  globalData: {
    userInfo: {},
    userInfoNeedReload: false,
    theme: 'light',
    model: "android",
    launchReady: false,
    token: "",
    token_exp: "",
    sys: {},
    scene: 0
  }
});

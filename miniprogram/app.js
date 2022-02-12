// app.js
require('./libs/Mixins.js');
import { getWxCloudEnv } from './config/request_config';
const themeListeners = []
App({
  onLaunch: function () {
    let _this = this;
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: getWxCloudEnv(),
        traceUser: true,
      });
    }
    // 获取当前信息
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
    // 监听系统主题变化
    wx.onThemeChange((themeResult) => {
      _this.themeChanged(themeResult.theme)
    })
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
    sys: {}
  }
});

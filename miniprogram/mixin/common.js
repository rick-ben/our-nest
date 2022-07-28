import { modal } from "../utils/util";
const httpApi = require('../service/http.api');
module.exports = {
  data: {
    error: '',
    versionNum: '',
    version: '', //小程序版本：develop=开发版；trial=体验版；release=线上版本
    isIPhone: false, // 是否是苹果设备
    isAndroid: false, // 是否是安卓设备
    theme: 'light', //主题：light=白色；dark=黑色
    options: {},  //页面启动参数
    colorPrimary: "#48c7fe",  //主色
    colorGrey: "#909399", //灰色
    colorWhite: "#ffffff", //白色
    colorBlack: "#333333", //黑色
  },
  /**
   * 请求接口
   * @param {String} apiName 接口名称，对应/service/http.api.js
   * @param {Object} params 携带数据
   * @param {Object} headers 自定义请求头
   */
  api(apiName, params, headers) {
    return new Promise((resolve, reject) => {
      if (typeof apiName == 'undefined') {
        console.error('接口名称不能为空');
        reject('apiName is error');
      }
      httpApi[apiName](params, headers).then(res => {
        resolve(res);
      }).catch(err => {
        reject(err);
      })
    })
  },
  /**
   * 获取当前小程序版本
   */
  getVersion() {
    const mini = getApp().globalData.sys.mini;
    this.setData({
      version: mini.envVersion,
      versionNum: mini.version
    })
  },
  /**
   * 判断当前小程序是否是开发版本
   */
  isDevelop() {
    if (this.version == 'develop') return true;
    return false;
  },
  /**
   * 重载用户数据
   */
  reloadUserInfo() {
    let that = this;
    let setinfo = {};
    return new Promise((reslove, reject) => {
      wx.cloud.callFunction({
        name: 'nestFunctions',
        data: {
          type: 'getUserInfo'
        }
      }).then((resp) => {
        console.log(resp)
        if (resp.result && resp.result.userData) {
          setinfo['userInfo'] = resp.result.userData;
          wx.setStorageSync('userInfo', resp.result.userData)
          getApp().globalData.userInfo = resp.result.userData;
          getApp().globalData.userInfoNeedReload = true;
          that.setData(setinfo);
          reslove();
        } else {
          reject();
        }
      }).catch((e) => {
        reject();
      });
    })
  },
  /**
   * 初始化公共混入数据
   */
  initCommonData() {
    let that = this;
    let app = getApp();
    let setinfo = {};
    // 判断设备类型
    if (app.globalData.model == "iPhone") {
      setinfo['isIPhone'] = true;
    } else {
      setinfo['isAndroid'] = true;
    }
    // 设置用户信息
    if (app.globalData.userInfo?._openid || app.globalData.scene == 1154){
      setinfo['userInfo'] = app.globalData.userInfo;
      success(that, setinfo);
    } else {
      getUserData(that, setinfo, 1);
      // 获取当前用户信息
      function getUserData(that, setinfo, num) {
        if (num >= 10) {
          if (that.isDevelop()) {
            return modal('登录失败','请检查配置文件、数据库、环境依赖是否都已配置完成');
          } else {
            return modal('登录失败','请检查网络是否可用，或清除缓存后，尝试重启小程序');
          }
        } else {
          wx.cloud.callFunction({
            name: 'nestFunctions',
            data: {
              type: 'getUserInfo'
            }
          }).then((resp) => {
            console.log(resp)
            if (resp.result && resp.result.userData) {
              setinfo['userInfo'] = resp.result.userData;
              wx.setStorageSync('userInfo', resp.result.userData)
              getApp().globalData.userInfo = resp.result.userData;
              success(that, setinfo);
            } else {
              getUserData(that, setinfo, num+=1)
            }
          }).catch((e) => {
            getUserData(that, setinfo, num+=1)
          });
        }
      }
    }

    // 成功的自定义函数，在页面js中接收
    function success(_this, setinfo) {
      _this.setData(setinfo);
      console.log('初始化信息成功')
      typeof _this.initSuccess == "function" && _this.initSuccess();
    }
  },
  /**
   * 修改主题
   * @param {String} theme 主题类型
   */
  themeChanged(theme) {
    this.setData({
      theme,
    });
    if (theme == 'dark') {
      this.setData({
        colorPrimary: "#47a4cc",
        colorGrey: "#7c7c7c",
        colorWhite: "#303030",
        colorBlack: "#ffffff"
      });
      wx.setNavigationBarColor({
        backgroundColor: '#1f1f1f',
        frontColor: '#ffffff'
      })
      let pages = getCurrentPages();
      let currPage = pages[pages.length-1].route;
      let tabPages = ["pages/home/index","pages/personal/index"];
      if (tabPages.indexOf(currPage) >= 0) {
        wx.setTabBarStyle({
          backgroundColor: '#1e1e1e',
          color: '#f6f6f6'
        })
      }
    }
  },
  /**
   * 页面加载
   * @param {*} options 
   */
  onLoad(options) {
    let _this = this;
    this.setData({
      options: options
    })
    // 获取小程序版本
    this.getVersion();
    // 初始化基本数据
    if (getApp().globalData.launchReady == false){
      let launchReadyInterval = setInterval(() => {
        if (getApp().globalData.launchReady){
          _this.initCommonData();
          clearInterval(launchReadyInterval);
        }
      }, 500);
    } else {
      _this.initCommonData();
    }
    // 监听系统主题改变
    const app = getApp();
    this.themeChanged(app.globalData.theme);
    app.watchThemeChange(this.themeChanged);
  },
  /**
   * 页面关闭
   */
  onUnload() {
    getApp().unWatchThemeChange(this.themeChanged);
  },
  /**
   * 页面显示
   */
  onShow() {
    let app = getApp();
    if (app.globalData.userInfoNeedReload) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  }
};
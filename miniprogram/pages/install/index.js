// pages/install/index.js
// 连接云数据库
const db = wx.cloud.database();

const { modal } = require('../../utils/util');
const base = require('../../config/base_config');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theme: '',
    list: [],
    showLoading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let _this = this;
    let configList = [];
    this.setData({
      theme: app.globalData.theme
    })
    let c1 = {};
    c1.title = "云开发环境ID配置";
    if (base.wx_cloud_env_develop != "" && base.wx_cloud_env_develop && base.wx_cloud_env_trial && base.wx_cloud_env_release) {
      c1.status = true;
      configList.push(c1);
    } else {
      c1.status = false;
      c1.tips = "请先创建云开发环境，并复制云开发环境id->再填写到/config/base_config.js文件中";
      configList.push(c1);
      return done();
    }

    let c3 = {};
    c3.title = "安装云开发依赖并部署云函数"
    c3.info = true;
    c3.tips = "此步骤需要自行确认，请对照部署文档确认设置的正确性。"
    configList.push(c3);
    
    let c2 = {};
    c2.title = "云数据库配置";
    let unApply = "";
    db.collection('users').get().then(res => {}).catch(err => {
      console.log('users 集合不存在');
      unApply += "users、";
    });

    db.collection('article').get().then(res => {}).catch(err => {
      console.log('article 集合不存在');
      unApply += "article、";
    });
    
    db.collection('configLoversBase').get().then(res => {}).catch(err => {
      console.log('configLoversBase 集合不存在');
      unApply += "configLoversBase、";
    });

    db.collection('photoAlbum').get().then(res => {}).catch(err => {
      console.log('photoAlbum 集合不存在');
      unApply += "photoAlbum、";
    });

    db.collection('photos').get().then(res => {}).catch(err => {
      console.log('photos 集合不存在');
      unApply += "photos、";
    });

    db.collection('articleComment').get().then(res => {}).catch(err => {
      console.log('articleComment 集合不存在');
      unApply += "articleComment、";
    });
    setTimeout(() => {
      if (unApply == "") {
        c2.status = true;
        configList.push(c2);
      } else {
        c2.status = false;
        c2.tips = "云数据库"+unApply+"未配置，请按教程手动配置";
        configList.push(c2);
        return done();
      }
      c4init();
    }, 2000);
    
    function c4init() {
      let c4 = {};
      c4.title = "设置数据库集合的数据权限"
      c4.info = true;
      c4.tips = "此步骤需要自行确认，请对照部署文档确认设置的正确性。"
      configList.push(c4);
      let c5 = {};
      c5.title = "部署完成，请按照文档继续配置基本信息"
      c5.status = true;
      configList.push(c5);
      let c6 = {};
      c6.title = "禁用当前安装辅助页面"
      c6.info = true;
      c6.tips = "请删除或屏蔽\"miniprogram/mixin/common.js\"第87行至90行代码";
      configList.push(c6);
      done();
    }
    


    function done() {
      _this.setData({
        list: configList,
        showLoading: false
      })
    }
  },

  //显示提示信息
  showTips(event){
    let value = event.target.dataset.tips;
    modal('提示',value, '确定','无法解决').catch(err=>{
      modal('提示','无法解决请联系微信：jidekf')
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
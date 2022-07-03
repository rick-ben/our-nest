// pages/personal/index.js
import { modal } from '../../utils/util';
Page({
  mixins: [require('../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    style: 2,
    btns: [{
      name: '清除缓存',
      fun: 'clearStorage'
    },{
      name: '退出小程序',
      fun: 'exitSys',
      ext_class: 'bg-grey color-white'
    }],
    btns2: [{
      name: '资料设置',
      fun: 'toSetting',
      icon: '/static/images/icon/common/edit.png'
    },{
      name: '清除缓存',
      fun: 'clearStorage',
      icon: '/static/images/icon/common/del.png'
    },{
      name: '退出应用',
      fun: 'exitSys',
      icon: '/static/images/icon/common/exit.png'
    },]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 页面数据初始化完成
   */
  initSuccess: function () {
    this.setData({
      showLoading: false
    })
    if (this.data.style == 1) {
      let btn = this.data.btns;
      if (this.data.userInfo.auth_deploy) {
        btn.unshift({
          name: '纪念日管理',
          fun: 'toAnniversary',
          icon: '/static/images/icon/common/riji.png'
        });
      }
      this.setData({
        btns: btn
      })
    } else if (this.data.style == 2) {
      let btn = this.data.btns2;
      if (this.data.userInfo.auth_deploy) {
        btn.unshift({
          name: '纪念日管理',
          fun: 'toAnniversary',
          icon: '/static/images/icon/common/riji.png'
        });
      }
      this.setData({
        btns2: btn
      })
    }
  },

  /**
   * 更新用户信息
   */
  updateUserInfo(){

  },

  /**
   * 按钮统一点击事件
   * @param {*} event 
   */
  tapButton(event){
    let index = event.currentTarget.dataset.index;
    let item = {};
    if (this.data.style == 1){
      item = this.data.btns[index];
    } else {
      item = this.data.btns2[index];
    }
    if (item.fun) {
      this[item.fun]();
    }
  },

  /**
   * 跳转到用户设置页面
   */
  toSetting(){
    wx.navigateTo({
      url: '/model-common/pages/user-setting/index'
    })
  },

  /**
   * 跳转到纪念日管理页
   */
  toAnniversary(){
    wx.navigateTo({
      url: '/model-common/pages/anniversary/index'
    })
  },

  /**
   * 清除小程序缓存
   */
  clearStorage(){
    modal('操作确认','确定要清除所有缓存吗','清除缓存','取消').then(res=>{
      wx.clearStorage({
        success: (res) => {
          modal('缓存已清理','为了保证数据正常，请退出应用后重启小程序');
        },
      })
    })
    
  },

  /**
   * 退出小程序
   */
  exitSys(){
    modal('操作确认','确定要退出小程序吗','退出','取消').then(res=>{
      wx.exitMiniProgram();
    })
  }
})
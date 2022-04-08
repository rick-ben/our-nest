// pages/personal/index.js
import { modal } from '../../utils/util';
Page({
  mixins: [require('../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    btns: [{
      name: '清除缓存',
      fun: 'clearStorage'
    },{
      name: '退出小程序',
      fun: 'exitSys',
      ext_class: 'bg-grey color-white'
    }]
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
    let item = this.data.btns[index];
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
   * 清除小程序缓存
   */
  clearStorage(){
    wx.clearStorage({
      success: (res) => {
        modal('提示','缓存已清理')
      },
    })
  },

  /**
   * 退出小程序
   */
  exitSys(){
    wx.exitMiniProgram();
  }
})
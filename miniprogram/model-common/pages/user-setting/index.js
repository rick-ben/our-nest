// model-common/pages/user-setting/index.js
import { loading, modal, stringLength, uploadMedia } from "../../../utils/util";
// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbUsers = db.collection('users');
// 数据库操作符
const _ = db.command;
Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true
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
   * 修改信息
   * @param {*} e 
   */
  formInputChange(e) {
    const { field } = e.currentTarget.dataset
    this.setData({
      [`userInfo.${field}`]: e.detail.value
    })
  },

  /**
   * 选择新的头像
   * @param {*} event 
   */
  changeAvatar(event){
    let _this = this;
    let setinfo = {};
    loading('头像上传中...');
    const avatarUrl = event.detail.avatarUrl;
    uploadMedia('avatar', avatarUrl).then(fileId=>{
      wx.hideLoading();
      setinfo['userInfo.avatar'] = fileId;
      _this.setData(setinfo);
    }).catch((e) => {
      wx.hideLoading();
      modal('提示','头像上传失败，请重试');
    });
  },

  /**
   * 提交用户信息修改
   */
  submitForm() {
    let _this = this;
    let curr = this.data.userInfo;
    loading('保存中...');
    if (stringLength(curr.phone) <= 0) {
      update(_this);
    } else {
      dbUsers.where({
        _openid: _.not(_.eq(curr._openid)),
        phone: _.eq(curr.phone)
      }).get().then(res=>{
        if (res.data.length >= 1) {
          modal('提示','手机号已被使用');
          wx.hideLoading();
        } else {
          update(_this)
        }
      }).catch(err=>{
        modal('提示', '资料保存失败，请重试');
        wx.hideLoading();
      })
    }
    
    function update(_this) {
      let curr = _this.data.userInfo;
      dbUsers.where({
        _openid: curr._openid
      }).update({
        data: {
          avatar: curr.avatar,
          nickname: curr.nickname,
          phone: curr.phone,
          email: curr.email ? curr.email : '',
          alias: curr.alias ? curr.alias : ''
        }
      }).then(res => {
        _this.reloadUserInfo(curr._openid).then(res => {
          modal('提示', '资料保存成功');
          wx.hideLoading();
        }).catch(err => {
          modal('提示', '资料保存失败，请重试');
          wx.hideLoading();
        })
      }).catch(err => {
        modal('提示', '资料保存失败，请重试');
        wx.hideLoading();
      })
    }
  }
})
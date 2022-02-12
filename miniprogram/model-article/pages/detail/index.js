// article/pages/detail/index.js
const { modal, format } = require('../../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbArticle = db.collection('article');
// 数据库操作符
const _ = db.command;
Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    info: {
      images: [],
      content: ""
    },
    showImageIndex: 0,
    showGallery: false
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
    let _this = this;
    if (this.data.options.id) {
      dbArticle.doc(this.data.options.id)
        .get().then(res => {
          let item = res.data;
          let setinfo = {};
          setinfo['info.images'] = item.files;
          setinfo['info.content'] = item.content;
          setinfo['info.location'] = item.location;
          setinfo['info.time'] = format(item.create_time, "yyyy-MM-dd HH:mm")
          setinfo['showLoading'] = false;
          wx.cloud.callFunction({
            name: 'nestFunctions',
            data: {
              type: 'getUserInfo',
              openid: item._openid
            }
          }).then((resp) => {
            console.log(resp)
            if (resp.result && resp.result.userData) {
              setinfo['info.user'] = resp.result.userData;
              _this.setData(setinfo);
            } else {
              modal('提示', '获取发布者信息失败');
            }
          }).catch((e) => {
            modal('提示', '获取发布者信息失败');
          });
        }).catch(err => {
          modal('提示', '获取文章信息失败');
        })
    } else {
      modal('非法参数', '请尝试重启小程序');
    }
  },

  /**
   * 预览图片
   */
  previewImage(event){
    let index = event.currentTarget.dataset.index;
    console.log(event)
    this.setData({
      showImageIndex: index,
      showGallery: true
    })
  },

  /**
   * 进入地图
   */
  toLocation() {
    let location = this.data.info.location;
    wx.openLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      name: location.name,
      address: location.address
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
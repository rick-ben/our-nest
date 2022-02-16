// article/pages/detail/index.js
const { modal, format, setString } = require('../../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbArticle = db.collection('article');
const users = db.collection('users');
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
      dbArticle.where({
        _id: this.data.options.id
      }).get().then(res => {
        let item = res.data[0];
        let setinfo = {};
        setinfo['info.images'] = item.files ?? [];
        setinfo['info.content'] = item.content;
        setinfo['info.location'] = item.location;
        setinfo['info.time'] = format(item.create_time, "yyyy-MM-dd HH:mm")
        setinfo['showLoading'] = false;
        setinfo['shareTitle'] = setString(item.content, 50);
        if (item?.files?.length >= 1) {
          let image = item.files[0];
          setinfo['shareImage'] = image;
        } else {
          setinfo['shareImage'] = '';
        }
        users.where({
          _openid: item._openid
        }).limit(1).get().then(resp => {
          if (resp.data.length >= 1) {
            setinfo['info.user'] = resp.data[0];
            _this.setData(setinfo);
          } else {
            modal('提示', '获取发布者信息失败');
          }
        }).catch(err => {
          modal('提示', '获取发布者信息失败');
        })
      }).catch(err => {
        console.log(err)
        modal('提示', '获取文章信息失败');
      })
    } else {
      modal('非法参数', '请尝试重启小程序');
    }
  },

  /**
   * 预览图片
   */
  previewImage(event) {
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
    return {
      title: this.data.shareTitle
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline: function () {
    return {
      title: this.data.shareTitle,
      imageUrl: this.data.shareImage
    }
  }
})
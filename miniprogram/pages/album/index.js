// pages/album/index.js
const { modal, toast, format } = require('../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbPhotoAlbum = db.collection('photoAlbum');
// 数据库操作符
const _ = db.command;

Page({
  mixins: [require('../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false,
    page: 0,
    list: [],
    loadMoreStatus: 'more',
    footerTip: ''
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
    this.loadAlbums();
  },
  onReachBottom: function () {
    if (this.data.loadMoreStatus == 'more') {
      this.loadAlbums();
    }
  },

  /**
   * 跳转到相册详情页
   */
  toDetail(event){
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/model-album/pages/detail/index?id='+id
    })
  },

  /**
   * 跳转到创建相册页面
   */
  toCreateAlbum(){
    wx.navigateTo({
      url: 'url',
    })
  },

  /**
   * 加载相册列表
   */
  loadAlbums() {
    let _this = this;
    let page = this.data.page;
    if (!this.data.userInfo.auth_view && page == 1) {
      this.setData({
        footerTip: '游客只能查看20个相册',
        loadMoreStatus: 'nomore'
      })
      return modal('提示', '游客只能查看20个相册');
    }
    this.setData({
      loadMoreStatus: 'loading'
    })
    let size = 20;
    let skip = page * size;
    dbPhotoAlbum.limit(size)
      .where(_.or([
        {
          member: _.in([this.data.userInfo._openid])
        },
        {
          is_public: _.eq(1)
        }
      ]))
      .skip(skip)
      .orderBy('create_time', 'desc')
      .get().then((res) => {
        let list = res.data;
        if (list.length >= 1) {
          let setinfo = {};
          list.forEach(element => {
            element.time = format(element.create_time, "yyyy-MM-dd HH:mm");
            if (element.alias == "") {
              if (element.name == "common") {
                element.alias = "动态相册";
              } else {
                element.alias = "未命名";
              }
            }
          });
          if (page == 0) {
            setinfo['list'] = list;
          } else {
            setinfo['list'] = [_this.data.list, ...list];
          }
          setinfo['page'] = page += 1
          setinfo['showLoading'] = false;
          setinfo['loadMoreStatus'] = 'more';
          _this.setData(setinfo);
          dbPhotoAlbum.where(_.or([
            {
              member: _.in([this.data.userInfo._openid])
            },
            {
              is_public: _.eq(1)
            }
          ])).count().then(res=>{
            if (res.total == list.length) {
              _this.setData({
                footerTip: '没有更多了',
                loadMoreStatus: 'nomore'
              })
            }
          })
        } else {
          toast("没有更多了");
          _this.setData({
            footerTip: '没有更多了',
            loadMoreStatus: 'nomore'
          })
        }
      }).catch((e) => {
        toast("数据加载失败", e);
      });
  }
})
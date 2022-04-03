// model-album/pages/detail/index.js
const { modal, toast, format } = require('../../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbPhotoAlbum = db.collection('photoAlbum');
const dbPhoto = db.collection('photos');
// 数据库操作符
const _ = db.command;

Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false,
    page: 0,
    list: [],
    loadMoreStatus: 'more',
    footerTip: '',
    auth: false,
    isAdmin: false,
    albumData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 预览照片
   */
  previewImage(event){
    let index = event.currentTarget.dataset.index;
    wx.previewMedia({
      sources: this.data.list,
      current: index
    })
  },

  /**
   * 页面数据初始化完成
   */
  initSuccess: function () {
    let _this = this;
    // 验证当前用户是否有权限访问
    dbPhotoAlbum.limit(1)
      .where(_.or([
        {
          member: _.in([this.data.userInfo._openid]),
          _id: this.data.options.id
        },
        {
          is_public: _.eq(1),
          _id: this.data.options.id
        },
        {
          _openid: this.data.userInfo._openid,
          _id: this.data.options.id
        }
      ]))
      .get().then((res) => {
        let list = res.data;
        if (list.length >= 1) {
          let data = list[0];
          _this.setData({
            albumData: data,
            auth: true
          })
          if (data._openid == this.data.userInfo._openid) {
            _this.setData({
              isAdmin: true
            })
          }
          // 设置页面标题
          if (data.alias == "") {
            if (data.name == "common") {
              data.alias = "动态相册";
            } else {
              data.alias = "未命名";
            }
          }
          wx.setNavigationBarTitle({
            title: data.alias,
          })
          // 公开相册则开启分享功能
          if (data.is_public == 1) {
            wx.showShareMenu({
              menus: ['shareAppMessage'],
            })
          }
          _this.loadAlbums();
        } else {
          _this.setData({
            footerTip: '无权访问',
            loadMoreStatus: 'nomore'
          })
          modal('提示', '你当前无权限访问该相册');
        }
      }).catch((e) => {
        toast("数据加载失败", e);
      });
  },

  /**
   * 跳转到相册配置页面
   */
  toAlbumSetting(){
    wx.navigateTo({
      url: '/model-album/pages/setting/index?id='+this.data.options.id
    })
  },

  /**
   * 上拉触底
   */
  onReachBottom: function () {
    if (this.data.loadMoreStatus == 'more' && this.data.auth) {
      this.loadAlbums();
    }
  },

  /**
   * 加载相册列表
   */
  loadAlbums() {
    let _this = this;
    let page = this.data.page;
    if (!this.data.userInfo.auth_view && page == 1) {
      this.setData({
        footerTip: '游客只能查看20张照片',
        loadMoreStatus: 'nomore'
      })
      return modal('提示', '游客只能查看20张照片');
    }
    this.setData({
      loadMoreStatus: 'loading'
    })
    let size = 20;
    let skip = page * size;
    dbPhoto.limit(size)
      .where({
        album_id: this.data.options.id
      })
      .skip(skip)
      .orderBy('create_time', 'desc')
      .get().then((res) => {
        let list = res.data;
        if (list.length >= 1) {
          let setinfo = {};
          list.forEach(element => {
            element.time = format(element.create_time, "yyyy-MM-dd HH:mm");
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
          dbPhoto.where({
            album_id: this.data.options.id
          }).count().then(res => {
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
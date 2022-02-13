// pages/home/index.js

const { modal, toast, format } = require('../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbArticle = db.collection('article');
const users = db.collection('users');
// 数据库操作符
const _ = db.command;
Page({
  mixins: [require('../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    articlePage: 0,
    articleList: [],
    loadMoreStatus: 'more',
    footerTip: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onReachBottom: function () {
    this.loadArticles();
  },

  /**
   * 页面数据初始化完成
   */
  initSuccess: function () {
    this.loadArticles();
  },

  /**
   * 加载文章列表
   */
  loadArticles() {
    let _this = this;
    let page = this.data.articlePage;
    if (!this.data.userInfo.auth_view && page == 1) {
      this.setData({
        footerTip: '游客只能查看最新20条动态',
        loadMoreStatus: 'nomore'
      })
      return modal('提示','游客只能查看最新20条动态');
    }
    this.setData({
      loadMoreStatus: 'loading'
    })
    let size = 20;
    let skip = page * size;
    dbArticle.limit(size)
    .skip(skip)
    .orderBy('create_time', 'desc')
    .get().then((res) => {
      let list = res.data;
      if (list.length >= 1) {
        let selectNum = 0;
        let dataLen = list.length;
        let setinfo = {};
        list.forEach(element => {
          element.time = format(element.create_time, "yyyy-MM-dd HH:mm")
          users.where({
            _openid: element._openid
          })
            .limit(1)
            .get()
            .then(ret => {
              if (ret.data.length >= 1) {
                element.user = ret.data[0];
              }
              selectNum += 1;
            })
        });
        if (selectNum == dataLen) {
          applyData(this, list);
        } else {
          let watchSelect = setInterval(() => {
            if (selectNum == dataLen) {
              applyData(this, list);
              clearInterval(watchSelect);
            }
          }, 500);
        }
        function applyData (_this, list){
          if (page == 0) {
            setinfo['articleList'] = list;
          } else {
            setinfo['articleList'] = [..._this.data.articleList, ...list];
          }
          setinfo['articlePage'] = page += 1
          setinfo['showLoading'] = false;
          setinfo['loadMoreStatus'] = 'more';
          _this.setData(setinfo);
        }
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
  },

  /**
   * 跳转到发布页面
   */
  toDeploy: function () {
    if (this.data.userInfo.auth_deploy) {
      wx.navigateTo({
        url: '/model-article/pages/deploy/index'
      })
    }
  },

  /**
   * 跳转到文章详情
   */
  toArticleDetail(event) {
    wx.navigateTo({
      url: '/model-article/pages/detail/index?id=' + event.currentTarget.dataset.id
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
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
    footerTip: '',
    deployUsers: {}, // 发布者列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onReachBottom: function () {
    if (this.data.loadMoreStatus == 'more') {
      this.loadArticles();
    }
  },

  /**
   * 下拉刷新页面
   */
  onPullDownRefresh: function () {
    this.loadArticles(true);
    setTimeout(() => {
      //2秒后停止下拉
      wx.stopPullDownRefresh({
        success: (res) => {},
      })
    }, 500);
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
  loadArticles(reload = false) {
    let _this = this;
    let page = this.data.articlePage;
    let deployUsers = this.data.deployUsers;
    console.log(deployUsers)
    if (reload) {
      this.setData({
        articlePage: 0,
        articleList: [],
        articleTotal: 0
      })
      page = 0;
    }
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
    dbArticle.where({
      _id: _.neq('')
    }).limit(size)
    .skip(skip)
    .orderBy('create_time', 'desc')
    .get().then((res) => {
      let list = res.data;
      if (list.length >= 1) {
        let selectNum = 0;
        let setinfo = {};

        getUser(list);
        //获取发布者信息
        function getUser(dataList) {
          if (!list[selectNum]) return;
          let currOpenid = list[selectNum]._openid;
          if (deployUsers[currOpenid]) {
            selectNum += 1;
            return getUser(list);
          } else {
            wx.cloud.callFunction({
              name: 'nestFunctions',
              data: {
                type: 'getUserInfo',
                openid: currOpenid
              }
            }).then((resp) => {
              if (resp.result && resp.result.userData) {
                let set = {};
                set['deployUsers.'+currOpenid] = resp.result.userData;
                _this.setData(set);
              }
              selectNum += 1;
              return getUser(list);
            })
          }
        }

        list.forEach(element => {
          element.time = format(element.create_time, "yyyy-MM-dd HH:mm")
        });

        if (page == 0) {
          setinfo['articleList'] = list;
        } else {
          setinfo['articleList'] = [..._this.data.articleList, ...list];
        }
        setinfo['articlePage'] = page += 1
        setinfo['showLoading'] = false;
        setinfo['loadMoreStatus'] = 'more';
        _this.setData(setinfo);
      } else {
        toast("没有更多了");
        _this.setData({
          showLoading: false,
          footerTip: '没有更多了',
          loadMoreStatus: 'nomore'
        })
      }
    }).catch((e) => {
      toast("数据加载失败", e);
    });
    dbArticle.where({
      _id: _.neq('')
    }).count().then(res=>{
      this.setData({
        articleTotal: res.total
      })
    })
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
   * 跳转到发布页面
   */
  toDeployText: function () {
    if (this.data.userInfo.auth_deploy) {
      wx.navigateTo({
        url: '/model-article/pages/deploy/index?text=1'
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
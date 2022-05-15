// article/pages/detail/index.js
const { modal, format, setString, toast, loading, stringLength } = require('../../../utils/util');
const base = require('../../../config/base_config');
// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbArticle = db.collection('article');
const users = db.collection('users');
const dbArticleComment = db.collection('articleComment');
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
    showGallery: false,
    commentLoadMoreStatus: 'more',
    commentFooterTip: '',
    comment: '',
    commentPage: 0,
    commentList: [],
    commentTotal: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 下拉触底
   */
  onReachBottom: function () {
    if (this.data.commentLoadMoreStatus == 'more') {
      this.loadComments();
    }
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
      this.loadComments();
    } else {
      modal('非法参数', '请尝试重启小程序');
    }
  },

  /**
   * 加载评论
   */
  loadComments(reload = false){
    let _this = this;
    let page = this.data.commentPage;
    if (reload) {
      this.setData({
        commentPage: 0,
        commentList: [],
        commentTotal: 0
      })
      page = 0;
    }
    
    if (!this.data.userInfo.auth_view && page == 1) {
      this.setData({
        commentFooterTip: '游客只能查看最新20条评论',
        commentLoadMoreStatus: 'nomore'
      })
      return modal('提示','游客只能查看最新20条评论');
    }
    this.setData({
      commentLoadMoreStatus: 'loading'
    })
    let size = 20;
    let skip = page * size;
    dbArticleComment.where({
      aid: _this.data.options.id,
      is_del: false
    }).limit(size)
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
          applyData(_this, list);
        } else {
          let watchSelect = setInterval(() => {
            if (selectNum == dataLen) {
              applyData(_this, list);
              clearInterval(watchSelect);
            }
          }, 500);
        }
        function applyData (_this, list){
          if (page == 0) {
            setinfo['commentList'] = list;
          } else {
            setinfo['commentList'] = [..._this.data.commentList, ...list];
          }
          setinfo['commentPage'] = page += 1;
          setinfo['commentLoadMoreStatus'] = 'more';
          _this.setData(setinfo);
        }
      } else {
        if (page != 0) {
          toast("没有更多了");
        }
        _this.setData({
          commentFooterTip: '没有更多了',
          commentLoadMoreStatus: 'nomore'
        })
      }
    }).catch((e) => {
      toast("数据加载失败", e);
    });
    dbArticleComment.where({
      aid: _this.data.options.id,
      is_del: false
    }).count().then(res=>{
      this.setData({
        commentTotal: res.total
      })
    })
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
  },

  /**
   * 输入评论内容
   * @param {*} event 
   */
  changeCommentCnt(event){
    this.setData({
      comment: event.detail.value
    })
  },

  /**
   * 提交评论
   */
  submitComment(){
    let _this = this;
    if (stringLength(this.data.comment) <= 0) {
      modal('提示','请先输入评论内容');
    }
    if (!this.data.userInfo.auth_view) {
      modal('提示','无权操作');
    }
    loading('正在提交评论');
    let commentData = {
      aid: this.data.options.id,
      comment: this.data.comment,
      create_time: db.serverDate(),
      is_del: false
    };
    dbArticleComment.add({
      data: commentData
    }).then(res=>{
      wx.hideLoading();
      toast('评论成功');
      _this.setData({
        comment: ''
      })
      _this.loadComments(true);
      // 调用api接口通过指定方式提醒新评论
      let noticeList = [];
      if (_this.data.userInfo._openid != _this.data.info.user._openid && _this.data.info.user.auth_notice) {
        noticeList.push(_this.data.info.user);
        _this.api('notice', {
          app_id: base.nest_app_id,
          app_key: base.nest_app_key,
          notice_list: noticeList,
          option_user: _this.data.userInfo,
          type: 'comment'
        }).then(ret=>{
          if (ret.type == 'false') {
            console.error(ret.msg)
          }
        })
      }
    }).catch(err=>{
      wx.hideLoading();
      toast('评论失败，请重试');
    })
  }
})
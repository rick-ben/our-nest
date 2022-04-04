// model-album/pages/detail/index.js
const { modal, toast, format, loading, uploadMedia, formatSeconds, downloadFile } = require('../../../utils/util');

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
  previewImage(event) {
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
          if (data.is_public == 1) {
            wx.showShareMenu({
              menus: ['shareAppMessage'],
            })
          }
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
          } else if (data.name == "common") {
            data.alias += "-动态";
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
   * 添加媒体
   */
  addMedia() {
    var _this = this;
    wx.chooseMedia({
      count: 9,
      mediaType: ['image', 'video'],
      maxDuration: 60
    }).then(res => {
      if (res.type == 'video') {
        var list = [];
        res.tempFiles.forEach(element => {
          list.push({
            width: element.width,
            height: element.height,
            duration: element.duration,
            duration_format: formatSeconds(element.duration),
            size: element.size,
            tempFilePath: element.tempFilePath,
            thumbTempFilePath: element.thumbTempFilePath
          })
        });
      } else {
        var list = [];
        res.tempFiles.forEach(element => {
          list.push({
            tempFilePath: element.tempFilePath
          });
        });
      }
      loading('文件上传中...');
      var mediaList = [];
      upload(() => {
        console.log('mediaList:', mediaList);
        wx.cloud.callFunction({
          name: 'nestFunctions',
          data: {
            type: 'addPhotos',
            filesData: mediaList
          }
        }).then((resp) => {
          if (resp.result.type) {
            wx.hideLoading();
            modal('提示', '上传文件成功');
            _this.loadAlbums(true);
          } else {
            wx.hideLoading();
            modal('提示', '上传文件失败');
          }
        }).catch((e) => {
          wx.hideLoading();
          console.log('保存数据失败', e);
        });
      });
      function upload(callback, index = 0) {
        if (!list[index]) return callback();
        let element2 = list[index];
        let urlPath = element2.tempFilePath;
        uploadMedia(res.type == 'video' ? 'videos' : 'images', urlPath).then(fileId => {
          if (res.type == 'video') {
            uploadMedia('video-thumb', element2.thumbTempFilePath).then(fileId2 => {
              mediaList.push({
                album_id: _this.options.id,
                url: fileId,
                thumb_url: fileId2,
                info: element2,
                type: res.type
              })
              return upload(callback, index + 1);
            }).catch(err => {
              return upload(callback, index + 1);
            })
          } else {
            mediaList.push({
              album_id: _this.options.id,
              url: fileId,
              type: res.type
            })
            return upload(callback, index + 1);
          }
        }).catch(err => {
          return upload(callback, index + 1);
        })
      }
    }).catch(err => { })
  },

  /**
   * 跳转到相册配置页面
   */
  toAlbumSetting() {
    wx.navigateTo({
      url: '/model-album/pages/setting/index?id=' + this.data.options.id
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
  loadAlbums(reload = false) {
    let _this = this;
    let page = 0;
    if (reload) {
      this.setData({
        page: 0
      })
    } else {
      page = this.data.page;
    }
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
            setinfo['list'] = [..._this.data.list, ...list];
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
          }).catch((e) => {
            console.log(e)
          });
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
   * 操作
   */
  mediaOption(event) {
    let _this = this;
    let index = event.currentTarget.dataset.index;
    let list = this.data.list;
    let info = list[index];
    let albumData = this.data.albumData;
    let userInfo = this.data.userInfo;
    let actionSheet = [];
    if (info.type != 'video') {
      actionSheet.push('分享给朋友');
    }
    if (albumData._openid == userInfo._openid) {
      actionSheet.push('删除');
    }
    wx.showActionSheet({
      itemList: actionSheet,
      success: (result) => {
        switch (actionSheet[result.tapIndex]) {
          case '分享给朋友':
            loading('处理文件中...')
            downloadFile(info.url, true).then(path=>{
              wx.hideLoading();
              wx.showShareImageMenu({
                path: path
              }).then(res=>{}).catch(err=>{})
            }).catch(err=>{
              wx.hideLoading();
              toast('文件下载失败');
            })
            break;
          case '删除':
            modal('确认操作', '确定要删除吗，数据将无法恢复', '删除', '取消').then(res => {
              let files = [];
              if (info.type == 'video') {
                files.push(info.thumb_url);
              }
              files.push(info.url);
              wx.cloud.callFunction({
                name: 'nestFunctions',
                data: {
                  type: 'delPhotos',
                  files: files
                }
              }).then((resp) => {
                console.log(resp)
                list.splice(index, 1);
                _this.setData({
                  list: list
                })
                toast('删除文件成功');
              }).catch((e) => {
                toast('删除文件失败，请重试');
              });
            })
            break;
          default:
            console.log('无操作');
            break;
        }
      },
      fail: (res) => { },
      complete: (res) => { },
    })
  }
})
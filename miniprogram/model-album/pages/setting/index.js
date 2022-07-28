// model-album/pages/setting/index.js

const { toast, modal, isNetworkUrl, loading, uploadMedia } = require('../../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbPhotoAlbum = db.collection('photoAlbum');
const dbUsers = db.collection('users');
// 数据库操作符
const _ = db.command;

Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: false,
    members: [],
    formData: {
      alias: '',
      is_public: 0,
      member: []
    },
    tempCover: {},
    showSelectMembers: false
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
    let user = this.data.userInfo;
    if (!user.auth_photo) return toast('无权访问');
    if (this.data.options.id) {
      wx.setNavigationBarTitle({
        title: '相册配置',
      })
      dbPhotoAlbum.doc(this.data.options.id).get().then(res=>{
        dbUsers.limit(20).where({
          _openid: _.in(res.data.member)
        }).get().then(ret=>{
          if (ret.data.length >= 1) {
            _this.setData({
              members: ret.data
            })
          }
        })
        _this.setData({
          formData: res.data,
          showLoading: false
        })
      }).catch(err=>{
        toast('加载数据失败');
      })
    } else {
      wx.setNavigationBarTitle({
        title: '相册创建',
      })
      this.setData({
        showLoading: false
      })
    }
  },

  /**
   * 选择封面
   */
  changeCover(){
    let _this = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      maxDuration: 30,
      camera: 'back'
    }).then(res=>{
      let cover = res.tempFiles[0];
      _this.setData({
        tempCover: cover,
        'formData.cover': cover.tempFilePath
      })
    }).catch(err=>{})
  },

  /**
   * 选择成员
   */
  changeMember(){
    this.setData({
      showSelectMembers: true
    })
  },

  /**
   * 更新成员列表
   */
  confirmMember(event){
    let userArr = [];
    event.detail.list.forEach(element => {
      userArr.push(element._openid);
    });
    this.setData({
      members: event.detail.list,
      'formData.member': userArr,
      showSelectMembers: false
    })
  },

  /**
   * 开关是否是公开相册
   */
  publicSwitchChange(event){
    this.setData({
      'formData.is_public': event.detail.value ? 1 : 0
    })
  },

  /**
   * 输入相册名字
   * @param {*} event 
   */
  changeAlias(event){
    this.setData({
      'formData.alias': event.detail.value
    })
  },

  /**
   * 提交保存
   */
  submitForm(){
    let _this = this;
    let data = this.data.formData;
    let user = this.data.userInfo;
    if (!user.auth_photo) return toast('无权访问');
    loading();
    // 如果公开，则清除成员
    if (data.is_public == 1) {
      data.member = [];
    }
    let updateData = {
      member: data.member,
      alias: data.alias,
      is_public: data.is_public
    }
    if (data.cover && isNetworkUrl(data.cover) == false) {
      const element = data.cover;
      uploadMedia('album-covers', element).then(fileID=>{
        updateData.cover = fileID;
        update(_this, updateData);
      }).catch((e) => {
        wx.hideLoading();
        console.log('上传图片失败');
      });
    } else {
      update(this, updateData);
    }
    function update(_this, updateData) {
      if (_this.data.options.id) {
        dbPhotoAlbum.doc(_this.data.options.id).update({
          data: updateData
        }).then(res=>{
          modal('提示','修改相册配置成功').then(ret=>{
            wx.navigateBack({
              delta: 1,
            })
          })
          wx.hideLoading();
        }).catch(err=>{
          wx.hideLoading();
          modal('提示','修改配置失败，请重试');
        })
      } else {
        updateData.name = 'custom';
        updateData.create_time = db.serverDate();
        try {
          dbPhotoAlbum.add({
            data: updateData
          }).then(res=>{
            modal('提示','创建相册成功').then(ret=>{
              wx.redirectTo({
                url: '/model-album/pages/detail/index?id='+res._id
              })
            })
            wx.hideLoading();
          }).catch(err=>{
            console.log(err)
            wx.hideLoading();
            modal('提示','创建相册失败，请重试');
          })
        } catch(e) {
          console.log(e)
          wx.hideLoading();
          modal('提示','创建相册失败，请重试');
        }
      }
    }
  },

})
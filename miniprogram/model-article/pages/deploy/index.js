// article/pages/deploy/index.js
import { getSysPermission, loading, modal, stringLength, toast } from "../../../utils/util";
// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbArticle = db.collection('article');
// 数据库操作符
const _ = db.command;

var checkDataI;
Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    files: [],
    content: "",
    contentLen: 0,
    location: "",
    errorTip: "",
    onlyText: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      selectFile: this.selectFile.bind(this),
      uplaodFile: this.uplaodFile.bind(this)
    })
    this.checkData();
  },

  /**
   * 页面数据初始化完成
   */
  initSuccess: function () {
    if (!this.data.userInfo.auth_deploy) {
      modal('无权访问','你当前没有获得授权');
    } else {
      this.setData({
        showLoading: false
      })
      if (this.data.options.text == 1) {
        this.setData({
          onlyText: true
        })
      }
    }
  },

  /**
   * 输入正文
   */
  inputContent(event) {
    let cnt = event.detail.value;
    let len = stringLength(cnt);
    if (len >= 5000) return;
    this.setData({
      content: cnt,
      contentLen: len
    })
  },

  /**
   * 选择的文件
   * @param {*} files 
   */
  selectFile(files) {
    console.log('files', files)
    // 返回false可以阻止某次文件上传
  },

  /**
   * 上传文件
   * @param {*} files 
   */
  uplaodFile(files) {
    let tempFilePaths = files.tempFilePaths;
    let fileLen = tempFilePaths.length;
    let uploadNum = 0;
    let urls = [];
    let fileList = this.data.files;
    for (let i = 0; i < fileLen; i++) {
      const element = tempFilePaths[i];
      let pattern = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
      let filePath = pattern.exec(element);
      let name = filePath[0];
      // 将图片上传至云存储空间
      wx.cloud.uploadFile({
        // 指定上传到的云路径
        cloudPath: 'images/' + name,
        // 指定要上传的文件的小程序临时文件路径
        filePath: element
      }).then(res => {
        urls.push(res.fileID);
        fileList.push(res.fileID);
        uploadNum++;
      }).catch((e) => {
        console.log(e);
        uploadNum++;
      });
    }
    // 文件上传的函数，返回一个promise
    return new Promise((resolve, reject) => {
      if (uploadNum == fileLen) {
        this.setData({
          files: fileList
        })
        add2album(urls);
        resolve({urls});
      } else {
        let upload = setInterval(() => {
          if (uploadNum == fileLen) {
            this.setData({
              files: fileList
            })
            add2album(urls);
            resolve({urls});
            clearInterval(upload);
          }
        }, 500);
      }
      function add2album(urls){
        wx.cloud.callFunction({
          name: 'nestFunctions',
          data: {
            type: 'addPhotos',
            files: urls
          }
        }).then((resp) => {
          console.log(resp)
        }).catch((e) => {
          console.log(e)
        });
      }
    })
  },

  /**
   * 删除文件
   */
  deleteFile(event){
    let fileUrl = event.detail.item.url;
    let index = event.detail.item.index;
    let files = this.data.files;
    files.splice(index, 1);
    this.setData({
      files: files
    })
    wx.cloud.callFunction({
      name: 'nestFunctions',
      data: {
        type: 'delPhotos',
        files: [fileUrl]
      }
    }).then((resp) => {
      console.log(resp)
    }).catch((e) => {
      console.log(e)
    });
  },
  /**
   * 选择地址
   */
  location(){
    let _this = this;
    getSysPermission('scope.userLocation').then(res=>{
      wx.chooseLocation({
        latitude: 0,
      }).then(addres=>{
        let obj = {
          name: addres.name,
          address: addres.address,
          latitude: addres.latitude,
          longitude: addres.longitude
        }
        _this.setData({
          location: obj
        })
      })
    })
  },
  /**
   * 检查文章内容是否已填完
   */
  checkData(){
    let _this = this;
    let setinfo = {};
    checkDataI = setInterval(() => {
      if (this.data.contentLen <= 0) {
        setinfo['errorTip'] = '请输入正文';
        _this.setData(setinfo);
      } else if (this.data.files.length <= 0 && !this.data.onlyText) {
        setinfo['errorTip'] = '请选择图片';
        _this.setData(setinfo);
      } else if (!this.data.location) {
        setinfo['errorTip'] = '请选择所在位置';
        _this.setData(setinfo);
      } else {
        setinfo['errorTip'] = '';
        _this.setData(setinfo);
      }
    }, 1000);
  },
  onUnload(){
    clearInterval(checkDataI);
  },
  uploadError(e) {
    console.log('upload error', e.detail)
  },
  uploadSuccess(e) {
    console.log('upload success', e.detail)
  },
  /**
   * 保存文章
   */
  submitMain(){
    let _this = this;
    let from = {};
    loading('请稍等...');
    if (this.data?.files.length >= 1) {
      from['files'] = this.data.files;
    }
    from['content'] = this.data.content;
    from['location'] = this.data.location;
    from['create_time'] = db.serverDate();
    dbArticle.add({
      data: from
    }).then(res=>{
      // 调用api接口通过公众号模板消息提醒新文章发布
      _this.api('deployNotice', {
        phone: _this.data.userInfo.phone,
        ss: '20220212210139PM',
        id: res._id
      })
      toast('发表成功！', 2000).then(ret=>{
        clearInterval(checkDataI);
        setTimeout(() => {
          wx.reLaunch({
            url: '/model-article/pages/detail/index?id='+res._id
          })
        }, 1500);
      })
    }).catch(err=>{
      wx.hideLoading();
      modal('发表失败','请检查网络，或稍后再试');
    })
  }
})
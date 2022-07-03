// model-common/pages/anniversary/index.js

const { modal, stringLength, toast } = require('../../../utils/util');

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbConfigLoversBase = db.collection('configLoversBase');
// 数据库操作符
const _ = db.command;
Page({
  mixins: [require('../../../mixin/common')],
  /**
   * 页面的初始数据
   */
  data: {
    showLoading: true,
    list: [],
    slideButtons: [{
      src: '/static/images/icon/common/edit.png'
    }, {
      src: '/static/images/icon/common/del.png'
    }],
    showAdd: false,
    showEdit: false,
    buttons: [
      {
        type: 'default',
        className: '',
        text: '取消',
        value: 0
      },
      {
        type: 'primary',
        className: '',
        text: '完成',
        value: 1
      }
    ],
    add: {
      desc: '',
      date: ''
    },
    edit: {
      o_desc: '',
      desc: '',
      date: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 页面数据初始化完成
   */
  initSuccess() {
    let _this = this;
    //查出所有纪念日
    wx.cloud.callFunction({
      name: 'nestFunctions',
      data: {
        type: 'getAnniversary'
      }
    }).then(res => {
      if (res.result.type) {
        _this.setData({
          list: res.result.data,
          showLoading: false
        })
      } else {
        modal('提示', res.result.msg);
      }
    }).catch(err => {
      console.log(err);
    })
  },

  /**
   * 删除
   */
  annEdit(event) {
    let _this = this;
    let list = this.data.list;
    let targetIndex = event.target.dataset.index;
    let buttonIndex = event.detail.index;
    let curr = list[targetIndex];
    if (curr.flag == 1 && buttonIndex == 1) {
      modal('提示', '相恋日不支持删除');
      return;
    } else if (buttonIndex == 0) {
      //修改
      this.setData({
        'edit.desc': curr.desc,
        'edit.o_desc': curr.desc,
        'edit.date': curr.start_time_de,
        'edit._id': curr._id,
        showEdit: true
      })
      return;
    } else if (buttonIndex == 1) {
      //删除
      modal('确认','确定要删除“'+curr.desc+'”吗？数据删除后无法恢复', '再想想','确认删除').catch(res=>{
        dbConfigLoversBase.where({
          _id: curr._id
        }).remove().then(res=>{
          toast('删除成功', 2000, 'success');
          _this.initSuccess();
        }).catch(err=>{
          toast('删除失败');
        })
      })
    }
  },

  /**
   * 打开添加窗口
   */
  openAdd() {
    this.setData({
      showAdd: true
    })
  },

  /**
   * 添加纪念日窗口按钮点击
   */
  addButtontap(event) {
    let _this = this;
    let item = event.detail.item;
    let addData = this.data.add;
    if (!this.data.userInfo.auth_deploy) {
      modal('提示','无权访问');
      return;
    }
    if (item.value == 0) {
      this.setData({
        showAdd: false
      })
    } else {
      if (stringLength(addData.desc) <= 0) {
        this.setData({
          error: '请输入纪念日描述'
        })
        return;
      } else if (stringLength(addData.date) <= 0) {
        this.setData({
          error: '请选择要纪念的日子是哪天'
        })
        return;
      }
      //保存纪念日
      let formData = {
        flag: 2,
        desc: addData.desc,
        start_time: new Date(addData.date)
      }
      dbConfigLoversBase.add({
        data: formData
      }).then(res=>{
        toast('保存成功', 2000, 'success');
        _this.setData({
          showAdd: false,
          'add.desc': '',
          'add.date': ''
        })
        _this.initSuccess();
      }).catch(err=>{
        toast('保存失败，请重试');
      })
    }
  },

  /**
   * 修改纪念日
   */
  editButtontap(event){
    let _this = this;
    let item = event.detail.item;
    let editData = this.data.edit;
    if (!this.data.userInfo.auth_deploy) {
      modal('提示','无权访问');
      return;
    }
    if (item.value == 0) {
      this.setData({
        showEdit: false
      })
    } else {
      if (stringLength(editData.desc) <= 0) {
        this.setData({
          error: '请输入纪念日描述'
        })
        return;
      } else if (stringLength(editData.date) <= 0) {
        this.setData({
          error: '请选择要纪念的日子是哪天'
        })
        return;
      }
      //保存纪念日
      let formData = {
        desc: editData.desc,
        start_time: new Date(editData.date)
      }
      dbConfigLoversBase.where({
        _id: editData._id
      }).update({
        data: formData
      }).then(res=>{
        toast('修改成功', 2000, 'success');
        _this.setData({
          showEdit: false
        })
        _this.initSuccess();
      }).catch(err=>{
        toast('保存失败，请重试');
      })
    }
  },

  /**
   * 纪念日描述输入
   */
  addInputChange(event){
    this.setData({
      "add.desc": event.detail.value
    })
  },

  /**
   * 添加纪念日修改时间
   * @param {*} event 
   */
  bindAddDateChange(event){
    let date = event.detail.value;
    this.setData({
      "add.date": date
    })
  },

  /**
   * 修改纪念日描述输入
   */
  editInputChange(event){
    this.setData({
      "edit.desc": event.detail.value
    })
  },

  /**
   * 修改纪念日修改时间
   * @param {*} event 
   */
  bindEditDateChange(event){
    let date = event.detail.value;
    this.setData({
      "edit.date": date
    })
  }
})
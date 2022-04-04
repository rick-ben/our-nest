// components/cm-select-members/index.js

import { modal, stringLength, toast } from "../../utils/util";

// 连接云数据库
const db = wx.cloud.database();
// 获取集合的引用
const dbUsers = db.collection('users');
// 数据库操作符
const _ = db.command;
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 是否显示
    show: Boolean,
    // 标题
    title: {
      type: String,
      value: '成员'
    },
    // 用户列表
    list: Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    theme: ''
  },

  options: {
    styleIsolation: 'apply-shared'
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      wx.getSystemInfo({
        success: (result) => {
          // 同步系统主题
          if (result.theme) {
            this.setData({
              theme: result.theme
            })
          }
        }
      })
      this.setData({
        search: this.search.bind(this)
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 列出搜索结果
     * @param {*} value 
     */
    search: function (value) {
      return new Promise((resolve, reject) => {
        if (stringLength(value) <= 0) {
          resolve([]);
        }
        let userArr = [];
        this.data.list.forEach(el => {
          userArr.push(el._openid);
        });
        dbUsers.limit(5).where({
          phone: {
            $regex: '.*' + value,
            $options: 'i'
          },
          _openid: _.nin(userArr)
        }).get().then(res => {
          if (res.data.length >= 1) {
            let list = [];
            res.data.forEach(element => {
              list.push({ text: element.nickname + '-' + element.phone, value: element });
            });
            resolve(list);
          } else {
            reject();
          }
        }).catch(err => {
          reject();
        })
      })
    },
    /**
     * 选择结果
     * @param {*} e 
     */
    selectResult: function (e) {
      let user = e.detail.item.value;
      let currUsers = this.data.list;
      currUsers.unshift(user);
      this.setData({
        list: currUsers
      })
      let searchbar = this.selectComponent('#searchbar');
      let result = searchbar.data.result;
      let index = 0;
      for (let i = 0; i < result.length; i++) {
        const element = result[i];
        if (element._id == user._id) {
          index = i;
          break;
        }
      }
      result.splice(index, 1);
      searchbar.setData({
        result: result
      })
    },
    /**
     * 取消选择
     */
    cancelSelect() {
      this.setData({
        show: false
      })
      let myEventDetail = {
        list: this.data.list
      } // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('cancel', myEventDetail, myEventOption);
    },
    /**
     * 完成操作
     */
    confirm() {
      let myEventDetail = {
        list: this.data.list
      } // detail对象，提供给事件监听函数
      let myEventOption = {} // 触发事件的选项
      this.triggerEvent('confirm', myEventDetail, myEventOption);
    },
    /**
     * 移除成员
     * @param {*} event 
     */
    _delUser(event) {
      let index = event.currentTarget.dataset.index;
      let user = this.data.list[index];
      let currList = this.data.list;
      modal('提示', '确定要移除成员' + user.nickname + '吗', '移除', '取消').then(res => {
        currList.splice(index, 1);
        this.setData({
          list: currList
        })
        toast('移除成员成功');
      }).catch(err => { })
    }
  }
})

// components/cm-nav/cm-nav.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 背景颜色
    backgroundColor: String,
    // 是否固定在顶部
    isFixed: Boolean,
    // 跳转的页面
    leftUrl: String,
    // 是否显示个人中心按钮
    userCenter: Boolean
  },

  options: {
    multipleSlots: true
  },

  /**
   * 页面的初始数据
   */
  data: {
    top: 0
  },

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () {
      const res = wx.getMenuButtonBoundingClientRect()
      this.setData({
        top: res.top
      })
    },
    moved: function () { },
    detached: function () { },
  },
  methods: {
    /**
     * 点击左边按钮跳转页面
     */
    _toLeftBtnPage() {
      let url = this.data.leftUrl;
      
      wx.navigateTo({
        url: url,
        success: (result) => {},
        fail: (res) => {},
        complete: (res) => {},
      })
    }
  }

})
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const users = db.collection('users');

/**
 * 根据openid获取用户信息，没有则新增用户信息
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  if (event.openid) {
    return getUserData(event.openid);
  } else {
    const wxContext = cloud.getWXContext();
    return getUserData(wxContext.OPENID);
  }
};

async function getUserData(openid) {
  let userData = {};
  await users.where({
    _openid: openid
  })
  .limit(1)
  .get()
  .then(res=>{
    if (res.data.length <= 0) {
      let addObj = {
        _openid: openid,
        nickname: '',
        alias: '',  //别名，用于通知时使用
        avatar: '',
        phone: '',
        email: '',
        auth_deploy: false, //发布文章权限
        auth_view: false, //查看小程序全部内容权限
        auth_photo: false,  //相册管理权限，创建属于该用户自己的相册
        auth_notice: false,  //获取通知权限，新文章、新评论等...
        create_time: db.serverDate()
      }
      try {
        users.add({
          data: addObj
        }).then(res=>{
          userData = addObj;
        }).catch(err=>{
          userData = false;
        })
      } catch(e) {
        userData = false;
      }
    } else {
      userData = res.data[0];
    }
  }).catch(err=>{
    userData = false;
  })
  return {
    userData
  }
}
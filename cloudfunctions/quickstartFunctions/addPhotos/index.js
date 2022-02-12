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
  return getUserData(event.openid);
};

async function getUserData(openid) {
  const wxContext = cloud.getWXContext();
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
        avatar: '',
        phone: '',
        auth_deploy: false, //发布文章权限
        auth_view: false, //查看小程序全部内容权限
        auth_photo: false,  //相册管理权限，创建属于该用户自己的相册
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
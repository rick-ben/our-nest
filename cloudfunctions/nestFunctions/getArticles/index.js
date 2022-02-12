const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const dbArticle = db.collection('article');
const users = db.collection('users');

/**
 * 根据openid获取用户信息，没有则新增用户信息
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  let size = event.size ? event.size : 20;
  let page = event.page ? event.page : 0;
  let skip = page * size;
  return getList(skip, size);
};

async function getList(skip, size) {
  return await dbArticle.limit(size)
  .skip(skip)
  .orderBy('create_time', 'desc')
  .get()
}
const getOpenId = require('./getOpenId/index');
const getUserInfo = require('./getUserInfo/index');
const addPhotos = require('./addPhotos/index');
const delPhotos = require('./delPhotos/index');
const getArticles = require('./getArticles/index');

// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'getUserInfo':
      return await getUserInfo.main(event, context);
    case 'addPhotos':
      return await addPhotos.main(event, context);
    case 'delPhotos':
      return await delPhotos.main(event, context);
    case 'getArticles':
      return await getArticles.main(event, context);
  }
};

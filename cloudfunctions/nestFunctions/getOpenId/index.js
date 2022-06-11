const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

/**
 * 获取openId云函数入口函数
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  // 获取基础信息
  const wxContext = await cloud.getWXContext();

  return {
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  };
};

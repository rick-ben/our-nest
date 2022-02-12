import http from './http';

let api = {};
//-----------------------------------通用---------------------------------------
// 文章发布时通知
api.deployNotice = function (params = {}) {
  return http.get('/wechat/nest/notice', params)
}

module.exports = api;
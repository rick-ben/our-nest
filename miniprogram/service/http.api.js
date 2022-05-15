import http from './http';

let api = {};
//-----------------------------------通用---------------------------------------
// 通知
api.notice = function (params = {}) {
  return http.post('/nest/common/notice', params)
}

module.exports = api;
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const users = db.collection('users');
const configLoversBase = db.collection('configLoversBase');

const MAX_LIMIT = 100;

/**
 * 获取纪念日列表云函数入口函数
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  // 获取用户信息
  let user = await users.where({
    _openid: wxContext.OPENID
  }).get();
  //判断当前用户是否有权限查看
  if (user.data[0] && user.data[0].auth_deploy) {
    user = user.data[0];
  } else {
    return {
      type: false,
      msg: '当前用户无权访问'
    };
  }
  
  // 先取出集合记录总数
  const countResult = await configLoversBase.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = configLoversBase.orderBy('start_time', 'desc').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  let anns = (await Promise.all(tasks)).reduce((acc, cur) => {
    return acc.data.concat(cur.data);
  })
  if (anns.data.length <= 0) {
    return {
      type: true,
      data: []
    };
  }
  let list = anns.data;
  let currTime = new Date().getTime();
  //计算纪念日时间
  list.forEach(element => {
    let startTimeDate = new Date(element.start_time);
    let beforeTime = currTime - startTimeDate.getTime();
    let beforeDay = Math.ceil(beforeTime / (1000*3600*24));
    if (beforeDay <= -1) {
      element.futureDay = Math.abs(beforeDay);
    } else {
      element.beforeDay = beforeDay;
    }
    
    //格式化日期
    element.start_time_de = format(startTimeDate, "yyyy-MM-dd");
  });
  return {
    type: true,
    data: list
  };
  function format(time, reg) {
    const date = typeof time === 'string' ? new Date(time) : time
    const map = {}
    map.yyyy = date.getFullYear()
    map.yy = ('' + map.yyyy).substr(2)
    map.M = date.getMonth() + 1
    map.MM = (map.M < 10 ? '0' : '') + map.M
    map.d = date.getDate()
    map.dd = (map.d < 10 ? '0' : '') + map.d
    map.H = date.getHours()
    map.HH = (map.H < 10 ? '0' : '') + map.H
    map.m = date.getMinutes()
    map.mm = (map.m < 10 ? '0' : '') + map.m
    map.s = date.getSeconds()
    map.ss = (map.s < 10 ? '0' : '') + map.s
  
    return reg.replace(/\byyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s\b/g, $1 => map[$1])
  }
};

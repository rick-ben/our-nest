/**
 * 转换格式"key:value;"的数据为数组对象
 * @param {*} xdata 
 */
export function transitionXdata(xdata) {
  if (xdata == "" || xdata.indexOf(":") == -1) return xdata;
  var dataobj = {};
  xdata = xdata.split(";");
  for (var i = 0; i < xdata.length; i++) {
    xdata[i] = xdata[i].split(":");
    dataobj[xdata[i][0]] = xdata[i][1];
  };
  return dataobj;
}

/**
 * 比较两个数字的大小，相等则返回0，左边大则返回1，右边大则返回-1，left和right是通过正则匹配到的值
 * @param {*} a 参与比较的left值
 * @param {*} b 参与比较的right值
 * @param {boolean} int 值是否必须为正数，为true时如果传入负数则返回0
 * @param {number} scale 允许的最大小数点位数，为0时会自动过滤掉小数
 */
export function comp(a, b, int = true, scale = 0) {
  var data = {
    left: 0,
    right: 0,
    type: 0
  };
  var reg = /([0-9]*)?/;
  if (scale) {
    switch (scale) {
      case 1:
        if (!int) {
          reg = /(\-*|\d*[0-9]*)+(\.[0-9]{1})?/;
        } else {
          reg = /([0-9]*)+(\.[0-9]{1})?/;
        }
        break;
      case 2:
        if (!int) {
          reg = /(\-*|\d*[0-9]*)+(\.[0-9]{1,2})?/;
        } else {
          reg = /([0-9]*)+(\.[0-9]{1,2})?/;
        }
        break;
      default:
        data['type'] = 2;
        return data;
    }
  } else if (!int) {
    reg = /(\-*|\d*[0-9]*)?/;
  };
  if (!reg.test(a) || !reg.test(b)) {
    data['type'] = 2;
    return data;
  };

  var regA, regB;
  regA = reg.exec(a);
  regB = reg.exec(b);
  a = Number(regA[0]);
  b = Number(regB[0]);
  data['left'] = a;
  data['right'] = b;
  if (a == b) return data;

  var maxNum = Math.max(a, b);
  if (maxNum == "NaN" || maxNum == "-Infinity") {
    data['type'] = 2;
    return data;
  };

  data['type'] = 1;
  if (maxNum == a) return data;

  data['type'] = -1;
  return data;
}

/**
 * 筛选数据
 * @param {*} config 
 */
export function filterDataList(config = {}) {
  return new Promise((reslove, reject) => {
    if (!config.list) return reject('缺少数据参数');
    if (!config.value) return reject('缺少需要匹配的参数value');
    if (!config.field) return reject('缺少需要匹配的参数field');
    var Cnt = config.list;
    var value = config.value;
    var field = config.field;
    var num = 0;
    for (var i = 0; i < Cnt.length; i++) {
      var name = Cnt[i][field];
      if (name.includes(value) == true) {
        Cnt.unshift(Cnt[i]);
        Cnt.splice(++i, 1);
        ++num;
      }
    }
    if (num) {
      reslove(Cnt);
    } else {
      reject('未搜索到匹配的数据');
    }
  })
}

/**
 * 获取窗口高度
 * @param {number} minus 要减去的高度
 */
export function getWinHeight(minus) {
  let globalData = getApp().globalData;
  let pixelRatio = globalData.pixelRatio;
  let sys = globalData.sys;
  return sys.screenHeight - (globalData.navBarHeight + (minus / pixelRatio));
}

/**
 * 时间格式化
 */
export function format(time, reg) {
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

/**
 * 将秒转为时分秒
 * @param {*} value 
 */
export function formatSeconds(value) {
  let result = parseInt(value)
  let h = Math.floor(result / 3600) < 10 ? '0' + Math.floor(result / 3600) : Math.floor(result / 3600);
  let m = Math.floor((result / 60 % 60)) < 10 ? '0' + Math.floor((result / 60 % 60)) : Math.floor((result / 60 % 60));
  let s = Math.floor((result % 60)) < 10 ? '0' + Math.floor((result % 60)) : Math.floor((result % 60));

  let res = '';
  if(h !== '00') res += `${h}:`;
  res += `${m}:`;
  res += `${s}`;
  return res;
}

/**
 * 比较数组是否相等
 */
export function compareArray(arr1, arr2) {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false
  if (arr1.length !== arr2.length) return false

  for (let i = 0, len = arr1.length; i < len; i++) {
    if (arr1[i] !== arr2[i]) return false
  }

  return true
}

/**
 * 合并两个对象
 */
export function merge(obj1, obj2) {
  Object.keys(obj2).forEach(key => {
    if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
      obj1[key] = obj1[key].concat(obj2[key])
    } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
      obj1[key] = Object.assign(obj1[key], obj2[key])
    } else {
      obj1[key] = obj2[key]
    }
  })

  return obj1
}

/**
 * 获取随机 id
 */
export function getId() {
  let seed = +new Date()
  return ++seed
}

/**
 * 获取用户系统授权
 * @param {*} scope 权限标识
 */
export function getSysPermission(scope) {
  let scopeList = {
    'scope.userInfo': '用户信息',
    'scope.userLocation': '地理位置',
    'scope.userLocationBackground': '后台定位',
    'scope.werun': '微信运动步数',
    'scope.record': '录音功能',
    'scope.writePhotosAlbum': '保存到相册',
    'scope.camera': '摄像头'
  }
  return new Promise((reslove, reject) => {
    wx.authorize({
      scope: scope,
      success() {
        reslove();
      },
      fail() {
        modal("提示", '您未授权' + scopeList[scope] + '，功能将无法使用', "去授权", "取消").then(ret => {
          wx.openSetting({
            success: (res) => {
              if (!res.authSetting[scope]) {
                modal("提示", "您未授权" + scopeList[scope] + "，功能将无法使用");
                reject();
              } else {
                reslove();
              }
            },
            fail: function () {
              reject();
            }
          })
        }).catch(err => {
          reject();
        })
      }
    })
  })
}

/**
 * 获取指定范围的随机数
 * @param {*} minNum 
 * @param {*} maxNum 
 */
export function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
    default:
      return 0;
  }
}

/**
 * 截取字符串，多余部分用...代替
 */
export function setString(str, len) {
  var strlen = 0;
  var s = "";
  for (var i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 128) {
      strlen += 2;
    } else {
      strlen++;
    }
    s += str.charAt(i);
    if (strlen >= len) {
      return s + "...";
    }
  }
  return s;
}

/**
 * 获取字符串长度
 * @param value 字符串
 */
export function stringLength(value) {
  if (!value) return 0;
  var len = 0, code = 0;
  for (var i = 0; i < value.length; i++) {
    code = value.charCodeAt(i);
    if (code >= 0 && code <= 127) {
      len += 1;
    } else {
      len += 2;
    }
  }
  return len;
}

/**
 * 提示框
 * @param title 标题
 * @param d 持续时间
 * @param i icon图标默认none,可选项:success,loading,none
 * @param img 自定义图片图标(图片路径)
 * @param mask 是否显示遮罩
 */
export function toast(title, d = 2000, i = 'none', img = '', mask = false) {
  return new Promise((reslove, reject) => {
    wx.showToast({
      title: title,
      icon: i,
      image: img,
      duration: d,
      mask: mask,
      success: function (res) {
        reslove();
      },
      fail: function (res) {
        reject();
      }
    })
  })
};

/**
 * 模态弹窗
 * @param title 标题
 * @param cnt 提示内容
 * @param firt 主按钮文字
 * @param cant 次按钮文字(不填则不显示)
 */
export function modal(title, cnt = '', firt = '确定', cant = false) {
  return new Promise((reslove, reject) => {
    wx.showModal({
      title: title,
      content: cnt,
      showCancel: cant,
      cancelText: cant ? cant : '',
      cancelColor: '#333',
      confirmText: firt,
      confirmColor: '#48c7fe',
      success: function (data) {
        if (data.confirm) {
          reslove();
        } else if (data.cancel) {
          reject();
        }
      },
      fail: function (res) {
        reject();
      }
    })
  })
};

/**
 * 加载提示
 * @param title 标题
 * @param m 是否显示遮罩
 */
export function loading(title = '加载中...', m = true) {
  return new Promise((reslove, reject) => {
    wx.showLoading({
      title: title,
      mask: m,
      success: function (res) {
        reslove();
      },
      fail: function (res) {
        reject();
      }
    })
  })
};

/**
 * 去除文本左右空格
 */
export function trim(s) {
  return s ? s.replace(/(^\s*)|(\s*$)/g, "") : s;
}

/**
 * 保存图片文件到本机
 * @param imageUrl 图片路径
 */
export function savePhotoFile(imageUrl) {
  return new Promise((reslove, reject) => {
    getSysPermission('scope.writePhotosAlbum').then(res => {
      exportFile();
    }).catch(err => {
      reject();
    })
    // 获取文件临时地址
    function exportFile() {
      loading("保存中...");
      downloadFile(imageUrl)
        .then(url => {
          save(url);
        })
        .catch(res => {
          reject();
        })
    }
    // 保存
    function save(filePath) {
      wx.saveImageToPhotosAlbum({
        filePath: filePath,
        success: (res) => {
          reslove();
        },
        fail: (err) => {
          reject();
        }
      })
    }
  })
}

/**
 * 下载文件到本地
 * @param {String} url 需要下载的网络链接地址
 * @param {Boolean} cloud 是否是云开发资源
 */
export function downloadFile(url, cloud = false) {
  return new Promise((resolve, reject) => {
    if (cloud) {
      wx.cloud.downloadFile({
        fileID: url, // 文件 ID
        success: res => {
          // 返回临时文件路径
          if (res.statusCode === 200) {
            resolve(res.tempFilePath);
          } else {
            reject(res.errMsg);
          }
        },
        fail(err) {
          reject(err);
        },
      })
    } else {
      if (isNetworkUrl(url)) {
        wx.downloadFile({
          url: url,
          success: (res) => {
            if (res.statusCode === 200) {
              resolve(res.tempFilePath);
            } else {
              reject(res.errMsg);
            }
          },
          fail(err) {
            reject(err);
          },
        });
      } else {
        // 返回本地地址
        resolve(url);
      }
    }
  });
}

/**
 * 验证是否是网络资源
 * @param {String} url 链接
 */
export function isNetworkUrl(url) {
  var isFormwork = true;//是否是网络资源
  try {
    //判断本地是否存在该文件
    wx.getFileSystemManager().accessSync(url);
    isFormwork = false;
  } catch (error) {
    //判断是否是小程序资源文件
    if (url.indexOf('static/images') >= 0) isFormwork = false;
  }
  return isFormwork;
}

/**
 * 检查身份证是否合法
 * @param {*} value 
 */
export function checkIdCardNumber(value) {
  let len = stringLength(value);
  if (len == 18) {
    let re = new RegExp(/^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|X)$/);
    var arrSplit = value.match(re);  //检查生日日期是否正确，value就是身份证号
    var dtmBirth = new Date(arrSplit[2] + "/" + arrSplit[3] + "/" + arrSplit[4]);
    var bGoodDay;
    bGoodDay = (dtmBirth.getFullYear() == Number(arrSplit[2])) && ((dtmBirth.getMonth() + 1) == Number(arrSplit[3])) && (dtmBirth.getDate() == Number(arrSplit[4]));
    if (!bGoodDay) {
      //alert(dtmBirth.getYear());
      //alert(arrSplit[2]);
      //alert('输入的身份证号里出生日期不对！');
      return false;
    }
    else { //检验18位身份证的校验码是否正确。 //校验位按照ISO 7064:1983.MOD 11-2的规定生成，X可以认为是数字10。
      var valnum;
      var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
      var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
      var nTemp = 0, i;
      for (i = 0; i < 17; i++) {
        nTemp += value.substr(i, 1) * arrInt[i];
      }
      valnum = arrCh[nTemp % 11];
      if (valnum != value.substr(17, 1)) {
        //alert('18位身份证的校验码不正确！应该为：' + valnum);
        return false;
      }
      return true;
    }
  }
}

/**
 * 生成随机字符串
 * @param {*} randomLen 随机长度
 * @param {*} min 最短
 * @param {*} max 最长
 */
export function createRandomStr(randomLen = false, min = 32, max = 64) {
  var str = "",
    range = min,
    arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k',
      'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
      'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F',
      'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
      'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  // 随机产生
  if (randomLen) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}

/**
 * 上传媒体文件
 * @param {*} cloudPathPrefix 云存储路径前缀
 * @param {*} tempFilePath 本地临时文件路径
 */
export function uploadMedia(cloudPathPrefix, tempFilePath) {
  return new Promise((resolve, reject) => {
    let pattern = /[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/;
    let filePath = pattern.exec(tempFilePath);
    let name = filePath[0];
    // 将图片上传至云存储空间
    wx.cloud.uploadFile({
      // 指定上传到的云路径
      cloudPath: cloudPathPrefix + '/' + name,
      // 指定要上传的文件的小程序临时文件路径
      filePath: tempFilePath
    }).then(ret => {
      let fileId = ret.fileID;
      resolve(fileId)
    }).catch((e) => {
      reject(e)
    });
  });
}
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const photos = db.collection('photos');
const photoAlbum = db.collection('photoAlbum');
const _ = db.command;

/**
 * 增加文件到相册
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  if (event.files && event.files.length >= 1) {
    return addPhotos(wxContext.OPENID, event.files, event.album);
  } else if (event.filesData) {
    let list = event.filesData;
    list.forEach(element => {
      element.create_time = db.serverDate();
      element._openid = wxContext.OPENID;
    });
    await photos.add({data: list}).then(res=>{
      result = {
        type: true,
        msg: "保存成功",
        data: res
      }
    }).catch(err=>{
      result = {
        type: false,
        msg: "保存文件出错",
        data: err
      }
    })
    return result;
  } else {
    return {
      type: false,
      msg: "文件必传"
    };
  }
};

/**
 * 添加文件
 * @param {*} openid 
 * @param {*} files 
 */
async function addPhotos(openid, files, album = 'common') {
  let result = {};
  await photoAlbum.where({
    _openid: openid,
    name: album
  })
  .limit(1)
  .get()
  .then(res=>{
    if (res.data.length <= 0) {
      let addObj = {
        _openid: openid,
        member: [],
        name: album,
        alias: '',
        create_time: db.serverDate()
      }
      try {
        photoAlbum.add({
          data: addObj
        }).then(res=>{
          updatePhotos(openid, res._id, files);
        }).catch(err=>{
          result = {
            type: false,
            msg: "新增相册出错"
          }
        })
      } catch(e) {
        result = {
          type: false,
          msg: "未知错误"
        }
      }
    } else {
      let album = res.data[0];
      updatePhotos(openid, album._id, files);
    }
  }).catch(err=>{
    result = {
      type: false,
      msg: "查询相册数据库出错"
    }
  })

  function updatePhotos(openid, album_id, files){
    let dataList = [];
    for (let i = 0; i < files.length; i++) {
      const photo = files[i];
      dataList.push({
        _openid: openid,
        album_id: album_id,
        url: photo,
        create_time: db.serverDate()
      })
    }
    photos.add({data: dataList}).then(res=>{
      result = {
        type: true,
        msg: "保存成功"
      }
    }).catch(err=>{
      result = {
        type: false,
        msg: "保存文件出错"
      }
    })
  }
  return result;
}
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const photos = db.collection('photos');
const _ = db.command;

/**
 * 删除指定文件
 * @param {*} event 
 * @param {*} context 
 */
exports.main = async (event, context) => {
  if (event.files && event.files.length >= 1) {
    return delPhotos(event.files);
  } else {
    return {
      type: false,
      msg: "文件必传"
    };
  }
};

/**
 * 删除文件
 * @param {*} files 
 */
async function delPhotos(files) {
  let result = {};
  // 先删除文件
  await cloud.deleteFile({
    fileList: files,
  }).then(res=>{
    photos.where({
      url: _.in(files)
    })
    .remove().then(res=>{
      result = {
        type: true,
        msg: "删除成功"
      }
    }).catch(err=>{
      result = {
        type: false,
        msg: "删除文件出错"
      }
    })
  }).catch(err=>{
    result = {
      type: false,
      msg: "删除文件出错"
    }
  })
  return result;
}
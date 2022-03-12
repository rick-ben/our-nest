const base = require('./base_config');

/**
 * 获取请求地址
 */
export function getApiBaseUrl() {
  switch (__wxConfig.envVersion) {
    case 'develop':
      if (base.trial_test) {
        return base.request_trial;
      } else {
        return base.request_develop;
      }
    case 'trial':
      return base.request_trial;

    case 'release':
      return base.request_release;

    default:
      return base.request_develop;
  }
}

/**
 * 获取微信云开发环境ID
 */
export function getWxCloudEnv() {
  switch (__wxConfig.envVersion) {
    case 'develop':
      if (base.trial_test) {
        return base.wx_cloud_env_trial;
      } else {
        return base.wx_cloud_env_develop;
      }

    case 'trial':
      return base.wx_cloud_env_trial;

    case 'release':
      return base.wx_cloud_env_release;

    default:
      return base.wx_cloud_env_develop;
  }
}
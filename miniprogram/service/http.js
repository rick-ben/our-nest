import { getApiBaseUrl } from '../config/request_config';

class Request {

	// 主要请求部分
	request(options = {}) {
		let noHeaderAuth = [
			'jscode2session'
		]

		options.dataType = options.dataType || this.config.dataType;
		options.responseType = options.responseType || this.config.responseType;
		options.url = options.url || '';
		options.params = options.params || {};
		options.header = Object.assign({}, this.config.header, options.header);
		options.method = options.method || this.config.method;

		// 判断请求是否需要在header中加入请求token
		let noHeader = false;
		for (let i = 0; i < noHeaderAuth.length; i++) {
			const element = noHeaderAuth[i];
			if (options.url.indexOf(element) != -1){
				noHeader = true;
				break;
			}
		}
		if (!noHeader){
			options.header.Authorization = getApp().globalData.token ?? wx.getStorageSync('token')
		}

		return new Promise((resolve, reject) => {
			options.complete = (response) => {
				// 请求返回后，隐藏loading(如果请求返回快的话，可能会没有loading)
				wx.hideLoading();
				// 清除定时器，如果请求回来了，就无需loading
				clearTimeout(this.config.timer);
				this.config.timer = null;
				// 判断用户对拦截返回数据的要求，如果originalData为true，返回所有的数据(response)到拦截器，否则只返回response.data
				if(this.config.originalData) {
					// 返回原始数据
          resolve(response);
				} else {
					if (response.statusCode == 200) {
						// 如果不是返回原始数据(originalData=false)，返回纯数据给then回调
            resolve(response.data);
					} else {
						// 不返回原始数据的情况下，服务器状态码不为200，modal弹框提示
						// if(response.errMsg) {
						// 	wx.showModal({
						// 		title: response.errMsg
						// 	});
						// }
						reject(response)
					}
				}
			}

      // 判断用户传递的URL是否/开头,如果不是,加上/
      var urlPattern = /[a-zA-z]+:\/\/[^\s]*/;  //正则匹配是否是url
			options.url = urlPattern.test(options.url) ? options.url : (this.config.baseUrl + (options.url.indexOf('/') == 0 ?
				options.url : '/' + options.url));
			
			// 是否显示loading
			// 加一个是否已有timer定时器的判断，否则有两个同时请求的时候，后者会清除前者的定时器id
			// 而没有清除前者的定时器，导致前者超时，一直显示loading
			if(this.config.showLoading && !this.config.timer) {
				this.config.timer = setTimeout(() => {
					wx.showLoading({
						title: this.config.loadingText,
						mask: this.config.loadingMask
					})
					this.config.timer = null;
				}, this.config.loadingTime);
			}
			wx.request(options);
		})
		// .catch(res => {
		// 	// 如果返回reject()，不让其进入this.$u.post().then().catch()后面的catct()
		// 	// 因为很多人都会忘了写后面的catch()，导致报错捕获不到catch
		// 	return new Promise(()=>{});
		// })
	}

	constructor() {
		this.config = {
			baseUrl: getApiBaseUrl(), // 请求的根域名
			// 默认的请求头
			header: {},
			method: 'POST',
			// 设置为json，返回后wx.request会对数据进行一次JSON.parse
			dataType: 'json',
			// 此参数无需处理，因为5+和支付宝小程序不支持，默认为text即可
			responseType: 'text',
			showLoading: true, // 是否显示请求中的loading
			loadingText: '请求中...',
			loadingTime: 800, // 在此时间内，请求还没回来的话，就显示加载中动画，单位ms
			timer: null, // 定时器
			originalData: false, // 是否在拦截器中返回服务端的原始数据，见文档说明
			loadingMask: true, // 展示loading的时候，是否给一个透明的蒙层，防止触摸穿透
		}

		// get请求
		this.get = (url, data = {}, header = {}) => {
			return this.request({
				method: 'GET',
				url,
				header,
				data
			})
		}

		// post请求
		this.post = (url, data = {}, header = {}) => {
			return this.request({
				url,
				method: 'POST',
				header,
				data
			})
		}
		
		// put请求
		this.put = (url, data = {}, header = {}) => {
			return this.request({
				url,
				method: 'PUT',
				header,
				data
			})
		}
		
		// delete请求
		this.delete = (url, data = {}, header = {}) => {
			return this.request({
				url,
				method: 'DELETE',
				header,
				data
			})
		}
	}
}
export default new Request

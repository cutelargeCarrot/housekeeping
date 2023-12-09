import { baseUrl } from './baseUrl'

export default class Request {
	http(param) {
		let url = param.url;
		let method = param.method;
		let header = param.header || {};
		let data = Object.assign(param.data || {});
		// let hideLoading = param.hideLoading || false;
		   
		let requestUrl = baseUrl + url;

		if (method) {
			method = method.toUpperCase(); //小写改为大写
			if (method == "POST") {
				header = {
					'content-type': "application/x-www-form-urlencoded",
					"Authorization": `Bearer ${uni.getStorageSync("access_token")}`
				};
			} else {
				header = {
					'content-type': "application/json",
					"Authorization": `Bearer ${uni.getStorageSync("access_token")}`
				};
			}
		}

		// if (!hideLoading) {
		//       uni.showLoading({
		// 	     title: '加载中...'
		//       });
		// }
		return new Promise((resolve, reject) => {
			// 请求
			uni.request({
				url: requestUrl,
				data: data,
				method: method,
				header: header,
				success: (res) => {
					// 将结果抛出
					if (res.data.status == 401 && !requestUrl.includes('/user/refresh_token')) {
						uni.request({
							url: baseUrl + '/user/refresh_token',
							header: {
								// "Authorization": `Bearer ${uni.getStorageSync("refresh_token")}`
							},
							data: {
								"refresh_token": uni.getStorageSync('refresh_token')
							},
							success: (res) => {
								console.log(res)
								if (res.data.status >= 400 || res.data.statusCode>400) {
									uni.removeStorageSync('access_token');
									uni.removeStorageSync('refresh_token');
									uni.switchTab({
										url:'/pages/home/home'
									})
									reject({ status: 401, message: '登陆过期' })
									
								} else {
									uni.setStorageSync('access_token', res.data.data.access_token);
									uni.setStorageSync('refresh_token', res.data.data.refresh_token);
									uni.request({
										url: requestUrl,
										data: data,
										method: method,
										header: {
											"Authorization": `Bearer ${uni.getStorageSync("access_token")}`
										},
										success: (res) => {
											resolve(res.data)
										}
									})
								}
							},
							fail:()=>{
								uni.removeStorageSync('access_token');
								uni.removeStorageSync('refresh_token');
							}
						})
					} else {
						resolve(res.data)
					}
				},
				//请求失败
				fail: (e) => {
					console.log(e)
					uni.showToast({
						title: "" + e.data.msg,
						icon: 'none'
					});
					resolve(e.data);
				},
				//请求完成
				complete() {
					//隐藏加载
					// if (!hideLoading) {
					//     uni.hideLoading();
					// }
					// resolve(reject);
					return;
				}
			})

		})
	}
}
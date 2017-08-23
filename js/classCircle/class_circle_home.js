//班级圈主页tab顶部导航
Vue.component("home-navbar-item", {
	template: "#temp_trends_navbar_item",
	props: ["value", "index", "is_on"],
	computed: {
		isOnClass: function() {
			return {
				'weui-bar__item--on': this.index == this.is_on //计算点中的选项
			}
		}
	},
	methods: {
		/**
		 * 点击顶部导航选项
		 * @param {Object} index
		 */
		click: function(index) {
			this.$emit("click-item", index);
		}
	}
});
//班级圈主页tab列表
Vue.component("home-bd-item", {
	template: "#temp_trends_tab_bd_item",
	props: ["value", "index", "is_on"],
	computed: {
		isOnClass: function() {
			return {
				'weui-tab__bd-item--active': this.index == this.is_on //计算显示的列表
			}
		}
	}
});

//添加动态组件
Vue.component("add-trends", {
	template: "#temp_add_trends_com",
	props: ["content"],
	data: function() {
		return {
			com_content: this.content //组件内的content
		}
	},
	methods: {
		/**
		 * 点击添加多媒体
		 * @param {Object} type 0,图库;1,相机
		 */
		addMedia: function(type) {
			this.$emit("add-media", type);
		},
		/**
		 * 点击提交按钮
		 */
		commit: function() {
			this.$emit("commit");
		}
	},
	watch: {
		/**
		 * 监控组件外的content
		 * @param {Object} val
		 */
		content: function(val) {
			this.com_content = val;
		},
		/**
		 * 监控组件内的content
		 * @param {Object} val
		 */
		com_content: function(val) {
			this.$emit("content-change", val);
		}
	}
});
//动态组件
Vue.component("trends-item", {
	template: "#template_trends",
	props: ["value"]
});
//与我相关组件
Vue.component("relate-item", {
	template: "#temp_relate_to_me",
	props: ["value"]
});

//班级圈主页数据
var home_data = {
	is_on: 0, //当前显示的列表
	home_tab: [{
		id: "all_trends", //tab列表的id
		title: "全部动态", //tab的名称
		scrollTop: 0, //tab列表的滚动距离
		leave: false, //是否离开
		show_loadmore: true, //是否显示加载更多
		allow_loadmore: false, //允许加载更多
		data: [] //tab列表的数据
	}, {
		id: "mine_trends",
		title: "我的动态",
		scrollTop: 0,
		leave: false,
		show_loadmore: true,
		allow_loadmore: false,
		data: []
	}, {
		id: "relate_to_me",
		title: "与我相关",
		scrollTop: 0,
		leave: false,
		show_loadmore: true,
		allow_loadmore: false,
		data: []
	}]
};
//发布动态页面数据
var add_trends_data = {
	allback: true,
	content: "", //文字，限制6000字
	images: [], //图片，限制9张
	video: '' //视频，限制一个
}
var mineUserInfo = {
	"userid": "moshanglin",
	"name": "莫尚霖",
	"department": [
		11
	],
	"order": [
		0
	],
	"position": "",
	"mobile": null,
	"english_name": "",
	"gender": 1,
	"isleader": 0,
	"telephone": null,
	"email": null,
	"weixinid": null,
	"avatar": "http: //shp.qpic.cn/bizmp/LlAHpaR9WIamIqUyfAicDggv1icib12xUv983mowPgnEeMwjJRENdrYhg/",
	"status": 1,
	"extattr": null,
	"errcode": 0,
	"errmsg": "ok",
	"P2PData": null
}; //我的个人信息model,查看参数详细信息请访问:http://open.work.weixin.qq.com/wwopen/doc#10019
var departUserInfo = {
	key: [],
	value: {}
}; //记录所有人的用户信息
var temp_data; //临时变量;用于查询我所处部门的所有成员
var router; //路由

window.onload = function() {
	$.showLoading('正在加载');
	initRouter();
	temp_data = 0;
	getDepartmentMember(mineUserInfo.department[temp_data]);
}

//设置路由
function initRouter() {
	//班级圈主页
	var class_circle_home = {
		template: "#temp_class_circle_home",
		data: function() {
			return home_data;
		},
		methods: {
			/**
			 * 改变显示的列表
			 * @param {Object} index
			 */
			clickItem: function(index) {
				if(index == home_data.is_on) {
					return;
				}
				home_data.home_tab[home_data.is_on].scrollTop = $("#" + home_data.home_tab[home_data.is_on].id).scrollTop();
				home_data.is_on = index;
				if(home_data.home_tab[home_data.is_on].leave) {
					home_data.home_tab[home_data.is_on].leave = false;
					var timeId = setInterval(function() {
						toBeforePosition(timeId, home_data.is_on);
					}, 100);
				}
			}
		},
		/**
		 * 组件显示之前
		 */
		beforeRouteEnter: function(to, from, next) {
			console.log("home-beforeRouteEnter:");
			console.log("to:" + to.path);
			console.log("from:" + from.path);
			next(function() {
				//初始化滚动
				initScroll();
				//回滚到之前的位置
				$("#" + home_data.home_tab[0].id).scrollTop(home_data.home_tab[0].scrollTop);
				$("#" + home_data.home_tab[1].id).scrollTop(home_data.home_tab[1].scrollTop);
				$("#" + home_data.home_tab[2].id).scrollTop(home_data.home_tab[2].scrollTop);
				home_data.home_tab[home_data.is_on].leave = false;
			});
		},
		/**
		 * 组件离开之前
		 */
		beforeRouteLeave: function(to, from, next) {
			console.log("home-beforeRouteLeave:");
			console.log("to:" + to.path);
			console.log("from:" + from.path);
			home_data.home_tab[home_data.is_on].scrollTop = $("#" + home_data.home_tab[home_data.is_on].id).scrollTop();
			home_data.home_tab[0].leave = true;
			home_data.home_tab[1].leave = true;
			home_data.home_tab[2].leave = true;
			next();
		}
	};
	//发布动态
	var add_trends = {
		template: "#temp_add_trends",
		data: function() {
			return add_trends_data;
		},
		methods: {
			/**
			 * 点击添加多媒体
			 * @param {Object} type 0,图库;1,相机
			 */
			addMedia: function(type) {
				console.log("add_trends-addMedia:" + type);
			},
			/**
			 * 点击提交按钮
			 */
			commit: function() {
				console.log("add_trends-commit:");
				var commitContent = $.trim(add_trends_data.content);
				console.log("commitContent:" + commitContent);
				if(commitContent === "") {
					$.toast("请输入内容", "forbidden");
					return
				} else {
					$.showLoading('正在上传数据');
					add_trends_data.allback = false;
					setTimeout(function() {
						$.hideLoading();
						$.toast("发布成功");
						add_trends_data.allback = true;
					}, 3000);
				}
			},
			/**
			 * 组件内的content变化的监控
			 * @param {Object} val
			 */
			contentChange: function(val) {
				add_trends_data.content = val; //组件内外content双向绑定
			}
		},
		beforeRouteEnter: function(to, from, next) {
			console.log("add-beforeRouteEnter:");
			console.log("to:" + to.path);
			console.log("from:" + from.path);
			next();
		},
		beforeRouteLeave: function(to, from, next) {
			console.log("add-beforeRouteLeave:");
			console.log("to:" + to.path);
			console.log("from:" + from.path);
			next(add_trends_data.allback);
		}
	};

	//配置路由
	router = new VueRouter({
		routes: [{
			path: '/home',
			component: class_circle_home
		}, {
			path: '/add',
			component: add_trends
		}]
	});

	var class_circle_app = new Vue({
		router: router
	}).$mount('#class_circle_app');
}

function initScroll() {
	/**
	 * 初始化下拉刷新
	 */
	$(".weui-tab__bd-item").pullToRefresh();
	$(".weui-tab__bd-item").on("pull-to-refresh", function() {
		var self = this
		setTimeout(function() {
			$(self).pullToRefreshDone();
		}, 2000)
	});

	//初始化加载更多
	$(".weui-tab__bd-item").infinite();
	$(".weui-tab__bd-item").infinite().on("infinite", function() {
		console.log("loadmore:" + this.id)
	});
}

/**
 * 回滚到原来的位置
 * @param {Object} timeId
 * @param {Object} index
 */
function toBeforePosition(timeId, index) {
	console.log("toBeforePosition:" + index);
	var scrollTop_0 = $("#" + home_data.home_tab[index].id).scrollTop();
	var scrollTop_1 = home_data.home_tab[index].scrollTop;
	if(scrollTop_0 == 0 && scrollTop_0 != scrollTop_1) {
		//之前设置回滚到初始位置无效
		$("#" + home_data.home_tab[index].id).scrollTop(home_data.home_tab[index].scrollTop);
	} else {
		clearInterval(timeId);
	}
}

/**
 * 获取用户的信息
 * @param {Object} id
 */
function getUserInfo(id) {
	var tempData = {
		cmd: 'userinfo',
		type: 'findpage',
		colid: id
	}
	unitWebsitePro(tempData, function(data) {
		console.log('getUserInfo:' + JSON.stringify(data));
		if(data.RspCode == 0 && data.RspData.userid != undefined) {
			if(id == 0) {
				//成功获取我的信息
				mineUserInfo = data.RspData;
				//获取我所属的部门的所有成员
				temp_data = 0;
				getDepartmentMember(mineUserInfo.department[temp_data]);
			}
		} else {
			$.hideLoading();
			$.alert(data.RspTxt, "加载失败");
		}
	});
}

/**
 * 处理获取的成员信息
 * @param {Object} data
 */
function disposeMemberData(data) {
	console.log("disposeMemberData:", data);
	if(data.RspCode == 0) {
		for(var i = 0; i < data.RspData.length; i++) {
			if(departUserInfo.value[data.RspData[i].userid] === undefined) {
				departUserInfo.key.push(data.RspData[i].userid);
				departUserInfo.value[data.RspData[i].userid] = $.extend(true, {}, data.RspData[i]);
			}
		}
	}
	if(temp_data == mineUserInfo.department.length - 1) {
		//查询完我所处部门的所有成员
		console.log("departUserInfo:" + departUserInfo);
		//显示班级圈主页
		router.push('home');
		$.hideLoading();
		//获取全部动态
		getAllUserSpaces(1);
	} else {
		temp_data++;
		getDepartmentMember(mineUserInfo.department[temp_data]);
	}
}

/**
 * 发送请求获取部门的所有的成员
 * @param {Object} 部门id
 */
function getDepartmentMember(id) {
	var tempData = {
		cmd: 'departpersons',
		type: 'findpage',
		colid: id,
		colv: 0,
		callcol: "info"
	}
	unitWebsitePro(tempData, disposeMemberData);
}

//获取全部动态
function getAllUserSpaces(pageIndex) {
	var postData = {
		userId: mineUserInfo.userid, //用户ID
		publisherIds: departUserInfo.key, //发布者ID
		pageIndex: pageIndex, //当前页数
		pageSize: 10 //每页记录数
	}
	classCircleProtocol.getAllUserSpacesByUser(postData, function(data) {
		console.log("getAllUserSpacesByUser:" + JSON.stringify(data));
		if(data.RspCode == 0) {
			console.log("length:" + data.RspData.Data.length);
			for(var i = 0; i < data.RspData.Data.length; i++) {
				//设置发布者的信息
				var temp_0 = data.RspData.Data[i];
				//temp_0.PublisherId="moshanglin"
				var userInfo = departUserInfo.value[temp_0.PublisherId];
				if(userInfo != undefined) {
					temp_0.PublisherName = userInfo.name;
					temp_0.PublisherImage = utils.updateHeadImage(userInfo.avatar, 2);
				} else {
					temp_0.PublisherName = temp_0.PublisherId;
					temp_0.PublisherImage = utils.updateHeadImage("", 2);
				}
				home_data.home_tab[0].data.push(temp_0);
			}
		} else {
			$.alert(data.RspTxt, "加载失败");
		}
	});
}
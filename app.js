var http = require('http')
var fs = require('fs')
var cheerio = require('cheerio')
var request = require('request')

var i = 0
// 初始化 URL
var url = "http://coi.hzau.edu.cn/index.php/index-view-aid-1815.html"

function fetchPage(x) { //封装函数
	startRequest(x)
}

function startRequest(x) {
	// 采用 http 模块向服务器发起一次 get 请求
	http.get(x, function(res) {
		var html = '' // 用来存储请求网页的整个 html 内容
		var titles = []
		res.setEncoding('utf-8') // 防止中文乱码
		// 监听 data 事件，每次取一块数据
		res.on('data', function(chunk) {
			html += chunk
		})
		// 监听 end 事件，如果整个网页内容的 html 都获取完毕，就执行回调函数
		res.on('end', function() {
			var $ = cheerio.load(html) // 采用 cheerio 模块解析 html
			var time = $('.info span:eq(1)').text().trim().split('：')[1]
			var news_item = {
				// 获取文章标题
				title: $('.art_title h4').text().trim(),
				// 获取文章发布时间
				time: time,
				// 获取作者
				author: $('.info span:eq(1)').text().trim().split('：')[1],
				// 获取文章的浏览次数
				views: $('.info span:eq(2)').text().trim().split('：')[1],
				// i 是用来判断获取了多少篇文章
				i: i+1
			}
			console.log(news_item)
		})
	}).on('error', function(err) {
		console.log(err)
	})
}

fetchPage(url) // 主程序开始运行

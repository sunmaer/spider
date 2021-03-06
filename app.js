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
		let html = '' // 用来存储请求网页的整个 html 内容
		let titles = []
		res.setEncoding('utf-8') // 防止中文乱码
		// 监听 data 事件，每次取一块数据
		res.on('data', function(chunk) {
			html += chunk
		})
		// 监听 end 事件，如果整个网页内容的 html 都获取完毕，就执行回调函数
		res.on('end', function() {
			let $ = cheerio.load(html) // 采用 cheerio 模块解析 html
			let time = $('.info .fl').eq(0).text().trim().split('：')[1]
			let news_item = {
				// 获取文章标题
				title: $('.art_title h4').text().trim(),
				// 获取文章发布时间
				time: time,
				// 获取作者
				author: $('.info .fl').eq(1).text().trim().split('：')[1],
				// 获取文章的浏览次数
				views: $('.info .fl').eq(2).text().trim().split('：')[1],
				// 文章 URL
				url: x,
				// i 是用来判断获取了多少篇文章
				i: i+1
			}
			console.log(news_item) // 打印新闻信息

			let news_title = $('.art_title h4').text().trim() 
			savedContent($, news_title) // 存储每篇新闻的标题和内容
			savedImg($, news_title) // 存储每篇新闻的图片

			// 下一篇文章的 URL
			let href = $('.art_page p').eq(1).children('a').attr('href')
			// 如果下一篇没有了，则结束
			if(href === 'javascript:void(0)') {
				console.log('文章抓取完毕，没有下一篇了')
			} else {
				let nextLink = "http://coi.hzau.edu.cn" + href
				if(i <= 100) {
					fetchPage(nextLink)
				}
			}
		})
	}).on('error', function(err) {
		console.log(err)
	})
}

// 爬取新闻内容资源
function savedContent($, news_title) {
	$('.art_content p').each(function(index, item) {
		let span = $(this).children('span')
		if(span.length) {
			let content = ''
			span.each(function(index, item) {
				content += $(this).text()
			})
			content += '\n'
			if(content) {
				fs.appendFile('./data/' + news_title + '.txt', content, 'utf-8', function(err) {
					if(err) {
						console.log(err)
					}
				})
			}
		}
	})
}

// 获取图片资源
function savedImg($, news_title) {
	$('.art_content p img').each(function(index, item) {
		let src = $(this).attr('src')
		let arr = src.split('/')
		let img_title = arr[arr.length - 1]
		let img_src = ''
		if(src.indexOf('http') === -1) {
			img_src = 'http://coi.hzau.edu.cn' + src
		} else {
			img_src = src
		}

		// 采用 request 模块，向服务器发起一次请求，获取图片资源
		request.head(img_src, function(err, res, body) {
			if(err) {
				console.log(err)
			}
		})
		request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '-' + img_title))
	})
}

fetchPage(url) // 主程序开始运行

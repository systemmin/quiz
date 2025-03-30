/**
 * https://www.ahzk365.com.cn/zhenti/hanyuzhenti/1086.html
 * 文本内容格式
 */
const fs = require('fs');

function format1() {
	// 读取文件
	const lines = fs.readFileSync('./data/美学-00037/202410.txt', "utf-8");

	// 拆分行
	const list = lines.split('\r\n');

	let content = '';

	// 遍历处理
	for (let i = 0; i < list.length; i++) {
		let line = list[i].trim();
		let options = line.split(" ").map(item => item.trim()).filter(item => item.length > 0);
		if (/\d+.+[A-Z]+/.test(line)) {
			options[0] = options[0] + "（）"
			options[options.length - 1] = options[options.length - 1] + "\r\n\r\n"
			console.log(options.join('\n'))
			content += options.join('\r\n');
		} else {
			console.log(line)
			content += line + '\r\n';
		}
	}

	fs.writeFileSync('./data/美学-00037/202410_format.txt', content, "utf-8");
}

function format2() {
	// 读取文件
	const lines = fs.readFileSync('./data/美学-00037/202304.txt', "utf-8");

	// 拆分行
	const list = lines.split('\n');

	let content = '';

	// 遍历处理、
	for (let i = 0; i < list.length; i++) {
		let line = list[i];
		line = line.replace(/(\d+)、/g, '$1.');
		line = line.replace(/([A-Z]+)、/g, '$1.');
		console.log(line)
		content+=line+"\n"
	}

	fs.writeFileSync('./data/美学-00037/202304_format.txt', content, "utf-8");
}
format2()
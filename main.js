const fs = require('fs');
const path = require('path');

const dataDirectory = './data';

function toUrlPath(path) {
	const paths = path.split("\\");
	return paths.join('/');
}

function readDirectory(dir) {
	const list = [];
	const entries = fs.readdirSync(dir, {
		withFileTypes: true
	});
	for (const entry of entries) {
		const subject = {
			name: entry.name,
			path: dir,
			list: [],
		}
		const subjectPath = path.join(dir, entry.name);
		const files = fs.readdirSync(subjectPath, {
			withFileTypes: true
		});
		const child = [];
		for (const file of files) {
			let fileName = file.name;
			if (file.isFile() && !fileName.endsWith('json')) {
				const jsonName = fileName.replace("txt", "json");

				const filePath = path.join(subjectPath, fileName);
				const jsonPath = path.join(subjectPath, jsonName);

				const result = analyzeTopic(filePath)
				fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2));

				child.push({
					name: fileName,
					path: toUrlPath(filePath)
				});
				child.push({
					name: jsonName,
					path: toUrlPath(jsonPath)
				});
			}
		}
		subject.list = child;
		list.push(subject);
	}
	return list;
}

/**
 * 题目类型检查
 * @param {Object} title
 * @returns {String} [ 'ACD' ]
 */
function topicTypeCheck(title) {
	// (ABCDE) 长度 7 ，字符从后往前截取 7 个长度，正则匹配正确内容。
	// 防止题目中有A-Z 
	let lastIndex = Math.min(title.length, 7);
	title = title.slice(-lastIndex);
	const matchs = title.match(/[A-Za-z]+/);
	if (matchs) {
		// 特殊情况 21.AT分类法
		const input = matchs['input'];
		if (input && input.match(/^\d+\.[A-Za-z]+/)) {
			return false
		}
	}
	return matchs;
}

/**
 * 选择题解析
 * @param {Object} answer 答案
 * @param {Object} options 项
 */
function choiceAnalysis(answer, options) {
	const answers = answer.split('');
	return options.map(item => {
		const checked = answers.some(v => item.includes(v));
		const content = item.replace(/^[A-Z]+\.?/g, '');
		return {
			content,
			checked: checked ? 1 : 0
		}
	})
}

/**
 * 文本分析，解析结构化数据，参数 2 选 1
 * @param {String} filePath 文件路径
 * @param {String} content 文本内容
 * @returns {Array} [{name:'',type:'',analysis:'',options:[]}]
 */
function analyzeTopic(filePath, content) {
	// 1、加载数据
	const data = filePath ? fs.readFileSync(filePath, 'utf8') : content;

	// 2、按行拆分，并删除注释 #
	const lines = data.split('\n').filter(item => !item.startsWith("#"));

	// 3、题目拆分，按空行分组，结果转二维数组
	const groupedArray = lines.reduce((result, value) => {
		let rows = value.trim();
		if (!rows.length) { // 按空行分组
			result.push([]);
		} else {
			// 否则，将元素添加到当前组的末尾
			if (result.length === 0) result.push([]); // 确保至少有一个组
			result[result.length - 1].push(rows);
		}
		return result;
	}, []).filter(item => item.length > 0); // 初始值为一个空数组,并过滤掉空数组

	// 4、解析 单选，多选，问答
	const listData = [];
	for (let i = 0; i < groupedArray.length; i++) {
		// 组
		let groups = groupedArray[i];
		// 从原数组删除 标题
		let title = groups.shift();
		// 类型：正确答案
		let matchs = topicTypeCheck(title);
		// 解析：-开头内容
		let analysis = '';
		let findIndex = groups.findIndex(item => item.startsWith('-'));
		if (findIndex != -1) {
			analysis = groups.splice(findIndex).join('\n').replace('-', '');
		}
		// 题目对象
		const topic = {};
		title = title.replace(/^\d+\.?/g, '');
		if (matchs) {
			let answer = matchs[0];
			// 替换题目默认答案
			topic.name = title.replace(answer, "");
			if (answer.length === 1) {
				topic.type = 1;
			} else {
				topic.type = 2;
			}
			topic.options = choiceAnalysis(answer, groups);
		} else {
			topic.name = title;
			topic.type = 3;
			analysis = groups.join('\n');
		}
		topic.analysis = analysis;
		listData.push(topic);
	}
	return listData;
}

/**
 * 匿名函数
 * 1、生成文件索引 indices
 * 2、解析文本生成 JSON 格式文件
 */
(() => {
	const indexes = readDirectory(dataDirectory);

	// // 将对象写入indexes.json文件
	fs.writeFileSync('./indexes.json', JSON.stringify(indexes, null, 2));

	console.log('写入完成');
})()
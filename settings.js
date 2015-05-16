module.exports = {
	debug: true,

    //domain
    sitedomain: 'doting.me',
    mobilesite: 'm.doting.me',

    //siteinfo
    sitename: '一点笔记 | Lite Notepad',
    title: '一点笔记',
    keywords: '笔记,云笔记,网络记事本, notes, records',
    describe: '一点笔记(doting.me),每天记录一点点!',
    // 添加到 html head 中的信息
	site_headers: [
		'<meta name="author" content="GallenHu@foxmail" />'
	],
    
    cookieSecret: 'doting2',

    // mongodb 配置
    db: 'mongodb://127.0.0.1/doting_dev',
    db_name: 'doting_dev'
};
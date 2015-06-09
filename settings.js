module.exports = {
	debug: true,

    //domain
    sitedomain: 'doting.me',
    mobilesite: 'm.doting.me',

    //siteinfo
    sitename: '海风笔记 | Lite Notepad',
    title: '海风笔记',
    keywords: '笔记,云笔记,网络记事本, notes, records',
    describe: '海风笔记(doting.me),有意思,随意记',
    // 添加到 html head 中的信息
	site_headers: [
		'<meta name="author" content="GallenHu@foxmail" />'
	],

    cookieSecret: 'doting',

    // mongodb 配置
    db: 'mongodb://127.0.0.1/doting_dev',
    db_name: 'doting_dev',

    //是否检测手机访问
    checkMobile: true
};
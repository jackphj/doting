var Note = require('../controllers').Note;
var eventproxy = require('eventproxy');

var log4js = require('log4js');
var logConfig = require('./logConfig.js');
log4js.configure(logConfig(__dirname));
var logInfo = log4js.getLogger('normal');



function getRandom(type, length) {
    var str = "",
        which,
        arr1 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
        arr2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    if (type === 'num') {
        which = arr1;
    } else if (type === 'word') {
        which = arr2;
    }

    // 随机产生
    for (var i = 0; i < length; i++) {
        pos = Math.round(Math.random() * (which.length - 1));
        str += which[pos];
    }

    return str;
};






function getFreshNoteUrl(callback) {
	var count = (function(){
		var id =0;
		return function(){
			return id++;
		}
	})();
    if (count > 50) {
        logInfo.warn("请求到50次旧笔记,时间:" + new Date());
        callback('Query Url OutTime!');
    }

    var noteUrl = getRandom('word', 3) + getRandom('num', 4);
    var ep = new eventproxy();
    Note.getNoteByUrl(noteUrl, ep.done('note')); //获取note

    ep.all('note', function(note) {
        if (note === null) {
            callback(null, noteUrl);
        } else {
        	//logInfo.warn("请求到已存在的笔记:" + note);
            noteUrl = ep = null;
            getFreshNoteUrl(callback);
        }
    });

}





function getNoteByUrl(url, callback){
    var ep = new eventproxy();
    Note.getNoteByUrl(url, ep.done('note')); //获取note
    ep.all('note', function(note) {
        if (note === null) {
            callback(null, url);
        }else{
            callback(note);
        }
        
    });
}




function getClientIP(req){
    var ipAddress;
    var headers = req.headers;
    var forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
    forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
    if (!ipAddress) {
      ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
}




// Exports
module.exports = {
    getRandom: getRandom,
    getFreshNoteUrl: getFreshNoteUrl,
    getNoteByUrl: getNoteByUrl,
    getClientIP: getClientIP
};
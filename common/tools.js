var Note = require('../controllers').Note;
var eventproxy = require('eventproxy');



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






var count = 0;
function getFreshNoteUrl(callback) {
    count++;
    if (count > 50) {
        //TODO写日志
        callback('Query Url OutTime!');
    }

    var noteUrl = getRandom('word', 3) + getRandom('num', 4);
    var ep = new eventproxy();
    Note.getNoteByUrl(noteUrl, ep.done('note')); //获取note

    ep.all('note', function(note) {
        if (note === null) {
            callback(null, noteUrl);
        } else {
            noteUrl = ep = null;
            getFreshNoteUrl(callback);
        }
    });

}





function getNoteByUrl(url, callback){
    var ep = new eventproxy();
    Note.getNoteByUrl(url, ep.done('note')); //获取note
    ep.all('note', function(note) {
        callback(note);
    });
}




// Exports
module.exports = {
    getRandom: getRandom,
    getFreshNoteUrl: getFreshNoteUrl,
    getNoteByUrl: getNoteByUrl
};
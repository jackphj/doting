var config = function(dir){
  return {
    "appenders": [
      { "type": "console" },
      {
        "type": "dateFile",  //dateFile类型才能有yyyy-MM格式
        "filename": dir + "/logs/log",
        "pattern": '.yyyy-MM-dd.log',
        "alwaysIncludePattern": true,
        //"maxLogSize": 1024,
        "category": "normal"
      },
      //可以写多个配置,通过category属性来区别调用
      {
        "type": "dateFile",  //dateFile类型才能有yyyy-MM格式
        "filename": dir + "/logs/log",
        "pattern": '.yyyy-MM-dd-hh.log',
        "alwaysIncludePattern": true,
        //"maxLogSize": 1024,
        "category": "onehour"
      }
    ],
    "replaceConsole": true
  };
};


module.exports = config;
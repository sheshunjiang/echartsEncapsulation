var ws=require("nodejs-websocket");
var server=ws.createServer(function(conn){
	conn.on("text",function(str){    //str为客户端发来的数据
		var dataJson={"name":"佘顺江","age":23};
		//var timer=setInterval(function(){
			dataJson.age=Math.round(Math.random()*100);
			conn.sendText(JSON.stringify(dataJson));
		//},1000);
		//conn.sendText("1");
		// setTimeout(function(){
		// 	clearInterval(timer);
		// },10000);
	});
	conn.on("close",function(code,reason){
		console.log("connection closed");
	});
	conn.on("error",function(err){
		console.log(err);
	});
}).listen(8001);




var http = require('http');
var urlTool =  require('url');
var querystring = require('querystring');
var jade = require('jade');
var fs = require('fs');
var validator = require('./validator');
var users = {}

http.createServer(function(req, res){
	console.log("crserver");
	switch(req.url){
		case '/validator.js':
			sendFile(res,'validator.js','text/javascript');
			break;
		case '/signup.js':
			sendFile(res,'signup.js','text/javascript');
			break;
		case '/style.css':
			sendFile(res,'style.css','text/css');
			break;
		default:
			req.method === 'POST' ? registUser(req, res) : sendHtml(req,res);
	}
}).listen(8124);
console.log("signup server listening 8124");

function sendFile(res,filepath,mine){
	console.log("snsfile");
	res.writeHead(200,{"Content-Type":mine});
	res.end(fs.readFileSync(filepath));
}

function registUser(req,res){
	console.log("registUser");
	req.on('data',function(chunk){
		try{
			var user = parseUser(chunk.toString());
			checkUser(user);
			users[user.username] = user;
			res.writeHead(301,{Location: '?username='+user.username});
			res.end(); 			
		}
		catch(error){
			console.warn("regist error",error);
			showSignup(res,user,error,message);
		}
	});
}

function checkUser(user){
	console.log("ckuser");
	var errorMessages = []
	for(var key in user){
		if(!validator.isFieldValid(key,user[key]))
			errorMessages.push(validator.form[key].errorMessage);
		if(!validator.isAttrValueUnique[users,user,key])
			errorMessages.push(
				"key: " + key+"is not unique by value:" + user[key]
			);
			
	}
	if(errorMessages.length > 0) 
		throw new Error(errorMessages.join('<br />'));
}

function parseUser(message){
	console.log("pruser");
	params = message.match(/username=(.+)&sid=(.+)&phone=(.+)&email=(.+)/);
	var user = {username: params[1],sid:params[2],phone:params[3],email:params[4]};
	console.log("user paesed is: ",user);
	return user;
}

function sendHtml(req, res){
	console.log("sendhtml");
	var username = parseUsername(req);
	if(!username || !isRegistedUser(username)){
		showSignup(res,{username:username},null);
	}
	else{
		showDetail(res, users[username])
	}
}
function parseUsername(req){
	return querystring.parse(urlTool.parse(req.url).query).username;
}
function isRegistedUser(username){
	return !!users[username];
}
function showSignup(res,user,error){
	showHtml(res,'signup.jade',{user:user,error:error});

}
function showDetail(res,user){
	showHtml(res,'detail.jade',user);
}
function showHtml(res,template,data){
	res.writeHead(200,{"Content-Type":"text/html"}); 
	res.end(jade.renderFile(template,data));	
} 
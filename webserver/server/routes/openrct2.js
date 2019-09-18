var express = require('express');
var path = require('path');
var async = require('async');
var https = require('https');
var sanitizer = require('sanitizer');
var multer = require('multer');
var exec = require('child_process').exec;

var router = express.Router();
var rctConfig = require("../config/openrct2-config.json");

//Multer Storage
var storage = multer.diskStorage({
	destination: function (req, file, callback){
		callback(null, rctConfig.save_dir);
	},
	filename: function(req, file, callback){
		var name = Date.now();
		callback(null, name + path.extname(file.originalname));
	}
});

//Set filters to on multer to protect server
var rctSave = multer({
	storage: storage,
	fileFilter: function(req, file, callback){
		var ext = path.extname(file.originalname);
		if(ext !== '.sv6'){
			return callback(new Error('Not a RCT2 save file!'));
		}else{
			callback(null, true);
		}
	},
});

//Submit a request to run an OpenRCT2 game instance
//TODO: Perhaps guard this by authentication
router.post('/start', rctSave.single('save'), function(req, res, next){
	var save = req.file;
	var port = Number.isInteger(Number(req.body.port)) ? req.body.port : rctConfig.port;
	console.log(req.body.port);
	console.log(save);

	execStart(save.filename, port, function(err, result){
		if(err){
			res.status(500).send(err.msg);
		}else{
			res.status(200).send("Got It!");
		}
	});
});

// FUNCTION CALLS //////////////////////////////////////////////////////////////

function execStart(name, port, callback){
	var test = "./" + rctConfig.script_dir + "/" + rctConfig.test;
	var executable = "./" + rctConfig.script_dir + "/" + rctConfig.exec;
	var save = rctConfig.save_dir + "/" + name;

	var cmd = executable + " " + save + " " + port;
	var tst = test + " " + save + " " + port;

	console.log(tst);
	console.log(cmd);

	var child = exec(tst, function(err, stdout, stderr){
		if(err || stderr){
			console.log(err);
			callback(err, null);
		}else{
			var run = exec(cmd);	//TODO: Pretty weird dirty hack :(
			console.log('stdout: ' + stdout);
    	console.log('stderr: ' + stderr);
    	callback(null, stdout);
		}
	});
}

module.exports = function(){
	return router;
}

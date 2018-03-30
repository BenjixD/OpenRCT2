var express = require('express');
var path = require('path');
var async = require('async');
var https = require('https');
var sanitizer = require('sanitizer');
var multer = require('multer');
var exec = require('child_process').exec;

var router = express.Router();
var rctConfig = require("../config/openrct2-config.json");

//Set filters to on multer to protect server
var rctSave = multer({
	fileFilter: function(req, file, callback){
		var ext = path.extname(file.originialname);
		if(ext !== '.sv6'){
			retrun callback(new Error('Not a RCT2 save file!'));
		}else{
			callback(null, true);
		}
	}
});

//Submit a request to run an OpenRCT2 game instance
//TODO: Perhaps guard this by authentication
router.post('/start', rctSave.single('save'), function(req, res, next){
	var save = req.file;
	var port = Number.isInteger(req.body.port) ? req.body.port : rctConfig.port;

	async.waterfall([
			function(callback){
				storeSaveFile(save, callback);
			},
			function(name, callback){
				execStart(name, port, callback);
			}
		], function(err, result){
			if(err){
				res.status(500).send(err.message);
			}
			else{
				console.log("Game is Starting");
				res.send(result);
			}
		});
});

// FUNCTION CALLS //////////////////////////////////////////////////////////////

function storeSaveFile(save, callback){
	var name = Date.now();
	var storage = multer.diskStorage({
		destination: function (req, file, callback){
			callback(null, rctConfig.save_dir);
		},
		filename: function(req, file, callback){
			callback(null, name + path.extname(file.originalname));
		}
	});

	var upload = multer({ storage: storage });
	upload(req, res, function(err){
		if(err){
			callback(err, null);	
		}else{
			callback(null, name);
		}
	});
}

function execStart(name, port, callback){
	var exec = "../" + rctConfig.script_dir + rctConfig.exec;
	var save = "../" + rctConfig.save_dir + name;

	var cmd = exec + " " + save + " " + port;
	console.log(cmd);

	exec(cmd, function(err, stdout, stderr){
		if(err){
			console.log(err);
			callback(err, null);
		}else{
			console.log('stdout: ' + stdout);
    	console.log('stderr: ' + stderr);
    	callback(null, stdout);
		}
	});
}

module.exports = function(){
	return router;
}

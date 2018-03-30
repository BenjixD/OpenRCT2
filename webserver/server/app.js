//Api
var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');

//Filesystem
var path = require('path');

//Startup Webserver
var app = express();
//Load Favicon from /public
app.use(favicon(path.join(__dirname, 'public', 'img', 'favicon.ico')));
//Body Parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//Serve from public
app.use(express.static(path.join(__dirname, 'public')));

//Serve Page
app.get('/', function(req, res, err){
	res.send("OpenRCT2 Startup page!");
});

//Routes
const openrct2 = require('./routes/openrct2')();
app.use('/openrct2', openrct2);

//Startup Server
app.listen(3000, function(){
	console.log('Server running on localhost:3000');
});
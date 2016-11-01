var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require('mongoose')
var session = require('express-session')
mongoose.connect('mongodb://127.0.0.1/tuojdata')

var contest=require('./models/user').contest
var judge=require('./models/user').judge
var user=require('./models/user').user

var homepage = require('./routes/homepage');
var contests = require('./routes/contests');
var addcontests = require('./routes/addcontests')
var upload = require('./routes/upload')

var app = express();

var userfilter = function(req,res,next){
	if (!req.session.user)
		return res.redirect('/')
	next()
}

var adminfilter = function(req,res,next){
	if (!req.session.admin)
		return res.redirect('/')
	next()
	
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret:'tuojguys',
	cookie:{maxAge:1000*60*10},
	resave: true,
	saveUninitialized: false
}))	

app.use('/contests',userfilter);
app.use('/addcontests',adminfilter);

app.use('/',homepage);
app.use('/contests',contests);
app.use('/addcontests',addcontests);
app.use('/problems',upload);

app.post('/api/judger/adopt', function(req, res) {
	judge.findOne({'pd':0},function(err,x){
		if (!x) {
			return res.send({});
		}
		x.pd=1
		x.save()
		res.send(x);
	})
});

app.post('/api/judger/upload', function(req, res) {
	
	console.log((new Date()).toLocaleTimeString() + ': ' + JSON.stringify(req.body));
	if (req.body.isEnd) {
		var cmd=req.body.cmd
		// judge score exec compile
		if (cmd=='score'){
			var id=parseInt(req.body.runId);
			judge.findOne({'runId':id},function(err,x){
				x.pd=parseInt(req.body.score)
				x.save()
			})
			console.log(req.body.runId,req.body.score);
		}
	}
	res.send({});
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


module.exports = app;

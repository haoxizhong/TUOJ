var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs');
var mongoose = require("mongoose");
var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
var autoIncrement = require("mongoose-auto-increment");

var app = express();


// set up mongo connection and session
mongoose.connect('mongodb://127.0.0.1/tuoj');
autoIncrement.initialize(mongoose.connection);
var EXPRESS_SESSION = require("./config.js").EXPRESS_SESSION;
EXPRESS_SESSION.store = new MongoStore({ mongooseConnection: mongoose.connection });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// catch all error to avoid server crash
app.use(function(req, res, next) {
    try {
        next()
    } catch (err) {
        next(err)
    }
});

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(EXPRESS_SESSION));

// check user whether has proper privilege
var login_required = function(req,res,next){
    if (!req.session.user) {
        return res.redirect("/login");
    } else {
        next();
    }
};
var admin_required = function(req,res,next) {
    if (!req.session.is_admin) {
        err = new Error("Not Found");
        err.status = 404;
        next(err);
    } else {
        next();
    }
};
app.use("/contests", login_required);
app.use("/addcontests", admin_required);
app.use("/problem_pool", admin_required);

// add router
app.use("/", require("./routes/homepage"));
app.use("/problem_pool", require("./routes/problem_pool"));
app.use('/addcontests',require("./routes/addcontests"));
app.use('/contests',require("./routes/contests"));
app.use('/api', require('./routes/api'));
//app.use('/status',require('./routes/status'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
console.log("env = " + app.get('env'));
if (app.get('env') === 'development') {
    // error handlers
    // development error handler
    // will print stacktrace
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            error: err,
            user: req.session.user,
            is_admin: req.session.is_admin
        });
    });
}  else {
    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        console.log("in production error handler");
        res.status(err.status || 500);
        res.render("error", {
            message: err.message,
            status: err.status,
            error: {},
            user: req.session.user,
            is_admin: req.session.is_admin
        });
    });
}

module.exports = app;

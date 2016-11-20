var express = require('express');
var router = express.Router();

var User = require('../models/user.js');
/* GET home page. */

router.get('/', function(req, res, next) {
	var session = req.session;
	// console.log(session.user);
	res.render('homepage', {
        title: "CCF CCSP",
        user: session.user,
        is_admin: req.session.is_admin
	});
});

router.get('/login',function(req,res,next) {
	//console.log(req.session);
	if (req.session.user) {
	    return next(new Error("Please logout first!"));
    }
    res.render('login',{user:req.session.user});
});

router.get('/logout', function(req, res, next){
    req.session.destroy();
    res.redirect('/');
});

router.post('/login',function(req,res,next){
	var username = req.body.username;
	var password = req.body.password;
	User.findOne({"username": username, "password": password}, function(err,x){
        if (!x) {
            err = new Error("Error Username or Password");
            return next(err);
		}
		req.session.user = username;
		req.session.is_admin = x.is_admin;
		req.session.uid = x._id
        res.redirect('/')
	});
});
module.exports = router;

var express = require('express');
var router = express.Router();

var user = require('../models/user').user
/* GET home page. */

router.get('/', function(req, res, next) {
	var sess=req.session
	console.log(sess.user)
	res.render('homepage', { title: 'OnsiteJudge for Tuoj' ,user: sess.user});
});

router.get('/login',function(req,res,next) {
	console.log(req.session)
	if (req.session.user)
		res.redirect('/')
	else	
		next()
},function(req,res,next){
	res.render('login',{user:req.session.user});
});

router.get('/logout',function(req,res,next){
	console.log(req.session)
	if (req.session.user)
		next()
	else	
		res.redirect('/');
},function(req,res,next){
	req.session.destroy()
	res.redirect('/');
});

router.post('/login',function(req,res,next){
	var id=req.body.username
	var pw=req.body.userpass
	console.log(req.session)
	user.findOne({'userid':id,'userpassword':pw},function(err,x){
		if (!x) {
			console.log('login error!')
			return res.redirect('/login')
		}
		console.log(id+' login successful')
		req.session.user=id
		if (x.power)
			req.session.admin=1
		res.redirect('/')
	})
});
module.exports = router;

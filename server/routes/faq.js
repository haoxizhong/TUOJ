var express = require('express');
var router = express();
router.get('/', function(req, res) {
	res.render('faq', {
		user: req.session.user
	});
});
module.exports = router;

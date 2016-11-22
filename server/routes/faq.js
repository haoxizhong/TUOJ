var express = require('express');
var router = express();
router.get('/:id', function(req, res) {
	res.render(req.params.id, {
		user: req.session.user
	});
});
module.exports = router;

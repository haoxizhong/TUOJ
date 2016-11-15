var router = require('express').Router(); 
var judge = require('../../models/models').judge;

router.post('/adopt', function(req, res) {
	judge.findOne({'pd':0},function(err,x){
		if (!x) {
			return res.send({});
		}
		pd=1
		x.save()
		res.send(x);
	})
});

router.post('/upload', function(req, res) {
	if (req.body.isEnd) {
		var cmd=req.body.cmd
		// judge score exec compile
		if (cmd=='score'){
			var id=parseInt(req.body.runId);
			judge.findOne({'runId':id},function(err,x){
				x.pd=2
				x.score=parseInt(req.body.score)
				x.save()
			})
			//console.log(req.body.runId,req.body.score);
		} else {
			judge.findOne({runId: req.body.runId}, function(err, doc) {
				if (doc) {
					doc.tusStep = req.body.tusStep;
					if (req.body.cmd == 'end') {
						doc.pd = 3;
					}
					doc.save();
				}
			});
		}
	}
	res.send({});
});

module.exports = router;

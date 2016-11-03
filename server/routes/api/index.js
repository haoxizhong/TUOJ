var router = require('express').Router();
router.use('/judger', require('./judger'));
module.exports = router;

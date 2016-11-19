var router = require('express').Router();
router.use('/judge', require('./judge'));
module.exports = router;

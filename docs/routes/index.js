var express = require('express');
var router = express.Router();

/* GET overview page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET api page. */
router.get('/api', function(req, res) {
    res.render('api', { title: 'Express' });
});

/* GET guide page. */
router.get('/guide', function(req, res) {
    res.render('guide', { title: 'Express' });
});

router.get('*', function(req, res) {
    res.render('index', { title: 'Express' });
});

module.exports = router;

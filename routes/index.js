var express = require('express');
var router = express.Router();
var photos = require('../modules/photos');

var config = require('../config');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload/image', function(req, res){
  var base64 = req.body.image;
  buf = new Buffer(base64.replace(/^data:image\/\w+;base64,/, ""),'base64')
  photos.UploadToAmazon(config.AWSConfig, buf,'see-to-learn',req.body.key)
    .then(function(result){
      res.json({error: false, result : result, resUrl : "https://s3.us-east-2.amazonaws.com/see-to-learn/"+req.body.key});
    }, function(err){
      console.log(err);
      res.status(400).json({error: true, message:'Error trying to sava image locally'});
    })

});

module.exports = router;

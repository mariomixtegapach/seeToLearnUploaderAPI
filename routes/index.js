var express = require('express');
var router = express.Router();
var photos = require('../modules/photos');
var fs = require('fs')
var config = require('../config.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload/image', function(req, res){
  var base64 = req.body.image;

  photos.UploadToAmazon(config.AWSConfig, base64,'see-to-learn',req.body.key)
    .then(function(result){
      res.json({error: false, result : result});
    }, function(err){
      console.log(err);
      res.status(400).json({error: true, message:'Error trying to sava image'});
    })

});

router.post('/upload/video/:name', function (req, res, next) {
  req.pipe(fs.createWriteStream('./uploadFile'));
  req.on('end', res.json);
});

module.exports = router;

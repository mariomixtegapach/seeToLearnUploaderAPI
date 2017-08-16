var fs = require('fs');
var q = require('q');
var AWS = require('aws-sdk')

module.exports = {
    SaveIntoLocal : function(base64Data, userUploadedFeedMessagesLocation, defaultSrc, pastSrc){
        try
        {
            var defer = q.defer();
            function decodeBase64Image(dataString) 
            {
                var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
                var response = {};

                if (matches.length !== 3) 
                {
                    return new Error('Invalid input string');
                }

                response.type = matches[1];
                response.data = new Buffer(matches[2], 'base64');

                return response;
            }


            var imageTypeRegularExpression      = /\/(.*?)$/;      

            var crypto                          = require('crypto');
            var seed                            = crypto.randomBytes(20);
            var uniqueSHA1String                = crypto
                                                .createHash('sha1')
                                                    .update(seed)
                                                    .digest('hex');

            var imageBuffer                      = decodeBase64Image(base64Data);
            userUploadedFeedMessagesLocation =  __dirname + '/../public/img/temps/';

            var publicImageUrl = '/img/temps/';

            var uniqueRandomImageName            = uniqueSHA1String;
            // This variable is actually an array which has 5 values,
            // The [1] value is the real image extension
            var imageTypeDetected                = imageBuffer
                                                    .type
                                                    .match(imageTypeRegularExpression);

            var userUploadedImagePath            = userUploadedFeedMessagesLocation + 
                                                uniqueRandomImageName +
                                                '.' + 
                                                imageTypeDetected[1];

            publicImageUrl += uniqueRandomImageName +
                                                '.' + 
                                                imageTypeDetected[1];

            // Save decoded binary image to disk
            try
            {
                console.log("Saving in ", userUploadedImagePath)
                fs.writeFile(userUploadedImagePath, imageBuffer.data,  
                                        function() 
                                        {
                                            if (fs.existsSync(pastSrc)) {
                                                fs.unlinkSync(pastSrc);
                                            }
                                            console.log("Saved in ", userUploadedImagePath)
                                            defer.resolve(publicImageUrl);
                                        });
            }
            catch(error)
            {
                console.log('ERROR:', error);
                defer.resolve(defaultSrc);
            }

        }
        catch(error)
        {
            console.log('ERROR:', error);
            defer.resolve(defaultSrc);
        }

        return defer.promise;
    },
    UploadToAmazon : function(AWSConfig, base64Data,bucketName,keyfile ){
       
        var defer = q.defer();
       
        AWS.config.update(AWSConfig);

        var s3 = new AWS.S3();
        s3.putObject({
            Bucket: bucketName,
            Key: keyfile,
            Body: base64Data,
            ContentEncoding:"base64",
            ContentType:"image/png",
            ACL:'public-read'
        },function (err,resp) {
           if(err){
               defer.reject(err);
           } else {
               defer.resolve(resp);
           }
        });

        return defer.promise;
    }
}
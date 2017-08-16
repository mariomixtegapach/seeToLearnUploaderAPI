var request = require('request');
var fs = require('browserify-fs');
var fileReaderStream = require('filereader-stream')

var _apiUrl ='http://localhost:4000'


var startUpload = function(file,curseName, onData, onFinish){
    // Client
    var io = require('socket.io-client');
    var ss = require('socket.io-stream');

    var socket = io.connect(_apiUrl);
    var stream = ss.createStream();
    var upload = ss.createBlobReadStream(file)
    var meta = {
        curseName:curseName,
        contentType:file.type
    }
    console.log(upload)
    var size = 0;
    upload.on("data", function (chunk) {
       size += chunk.length;
       console.log(Math.floor(size / file.size * 100) + '%');
       if(typeof onData == 'function'){
           onData(chunk);
       }
    })

    upload.on("end", function (res) {
      if(typeof onFinish == 'function'){
           onFinish(res);
       }
    });

    

    ss(socket).emit('foo', stream);
    upload.pipe(stream)
    //upload.pipe(stream);


    // upload.pipe(r);


}


var request = require("request");
var MjpegConsumer = require("mjpeg-consumer");
var FileOnWrite = require("file-on-write");
var http = require('http');
var fs = require('fs');
var mjpegServer = require('node-mjpeg-server');
var jpeg = require('jpeg-js');



var dir = 'video'
var imgDir = './' + dir;

var i = 0;
var files = [];
var changes = false;
var maxNum = 10;

var rawImageData;
function changePixel(x,y,callback){
    console.log("bla");
    callback();
}

var writer = new FileOnWrite({
    path: imgDir,
    ext: '.jpg',
    filename: function(){
        var filename = (i > maxNum*2) ? i = 0 : ++i;

        if(files.length <= maxNum){
            files.push(filename);
        }else{
            while(files.length > maxNum){
                var del = files.shift();
                fs.unlink(imgDir+"/"+del+".jpg");
            }
            files.push(filename);
        }
        // console.log(files);
        changes = true;
        return filename;
    },
    transform: function(data, callback){

        function pidx(width, height, w, h, c){
            // how many full lines?
            var fullLines = h * width * 4;
            var sameLinePixels = w * 4;

            return fullLines + sameLinePixels + c
        }

        // console.log(data);
        try {
            // addalert("bad call");
            rawImageData = jpeg.decode(data, true);
            // rawImageData.data.length;
            // console.log(rawImageData.width);
            // console.log(rawImageData.height);
            // console.log(rawImageData.data);
            // console.log("-");
            for(var i = 0; i < 50; i+=2){
                var fp = pidx(rawImageData.width, rawImageData.height, i, 10, 0)
                rawImageData.data[fp] = 255;
                rawImageData.data[fp+1] = 0;
                rawImageData.data[fp+2] = 0;
            }
            for(var i = 200; i < 450; i+=2){
                var fp = pidx(rawImageData.width, rawImageData.height, i, 100, 0)
                rawImageData.data[fp] = 255;
                rawImageData.data[fp+1] = 0;
                rawImageData.data[fp+2] = 0;
            }
            var fp = pidx(rawImageData.width, rawImageData.height, 52, 10, 0)
            rawImageData.data[fp] = 255;
            rawImageData.data[fp+1] = 0;
            rawImageData.data[fp+2] = 0;


            newJPG = jpeg.encode(rawImageData, 100);

            // return newJPG.data;
            callback(newJPG.data);
        }
        catch(e) {
            console.log("err");
            callback(data);
        }
    }
});
var consumer = new MjpegConsumer();


//////////////
////STREAM////
//////////////

var w = 160; // 320 or 160 etc.
var h = 120; // 240 or 210 etc.
// taiwan port
// var stream = request("http://117.56.116.103/mjpg/video.mjpg").pipe(consumer).pipe(writer);
// taiwan entrance
// var stream = request("http://114.33.6.120:10000/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// taiwan messy room
var stream = request("http://1.34.197.140:10000/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// spain house
// var stream = request("http://95.19.61.157:83/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);

// beach brazil
// http://187.8.158.90/mjpg/video.mjpg?COUNTER

// light tower
// var stream = request("http://75.134.86.115/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// motorway
// var stream = request("http://166.154.145.84/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// windmill
// var stream = request("http://107.1.228.34/axis-cgi/mjpg/video.cgi?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);

var starter = setInterval(function(){
    if(files.length >= maxNum - 1){
        console.log("ready to serve");
        clearInterval(starter);






        http.createServer(function(req, res) {
          console.log("Got request");

          mjpegReqHandler = mjpegServer.createReqHandler(req, res);

          var timer = setInterval(updateJPG, 50);
          var frameCount = 0;
          var timer = setInterval(function(){
            //   changes = true;
              if(changes){
                  changes = false;
                  if(frameCount % 1000 == 0){
                      console.log("frames:" + frameCount);
                  }
                  frameCount++;
                  updateJPG();
              }
          }, 10);

          function updateJPG() {
            fs.readFile(__dirname + "/" + dir +"/"+ files[files.length-2] + ".jpg", sendJPGData);
          }

          function sendJPGData(err, data) {

            mjpegReqHandler.write(data, function() {
              checkIfFinished();
            });
          }

          function checkIfFinished() {
            // if (i > 100) {
            //   clearInterval(timer);
            //   mjpegReqHandler.close();
            //   console.log('End Request');
            // }
          }
        }).listen(8081);







    }
}, 500);

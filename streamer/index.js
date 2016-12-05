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
// var binary = "010010000110010101101100011011000110111100100000010011010111100100100000011011100110000101101101011001010010000001101001011100110010000001001100011001010110111101101110"
// var binary = " 01001000 01100101 01101100 01101100 01101111 00100000 01101101 01111001 00100000 01101110 01100001 01101101 01100101 00100000 01101001 01110011 00100000 01001100 01100101 01101111 01101110"
var binary = "01001100 01100101 01101111 01101110 00100000 "
// var binary = "101010101010101010101"
var binary_idx = 0;
var pixX = 30;
var pixY = 30;


var clock_binary ="101010101010101010101";
var clockInterval = 15;
var clock_index = 0;
var clock = 0;
// var pixelcarry = [];
// for(var i = 0; i < 120; i+=1){
//     var temp = [];
//     for(var j = 0; j < 160; j++){
//         if(Math.random() < 0.05){
//             temp.push(1);
//         }else{
//             temp.push(0);
//         }
//     }
//     pixelcarry.push(temp)
// }
var signalPause = false;

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
            var fullLines = h * width * 4;
            var sameLinePixels = w * 4;
            return fullLines + sameLinePixels + c
        }
        // console.log(data);
        try {
            rawImageData = jpeg.decode(data, true);


            // --------------------------------------------
            // ---------- manipulate pixel here:

            var fp = pidx(rawImageData.width, rawImageData.height, pixX, pixY, 0);
            // console.log(fp);
            // var av = (rawImageData.data[fp+1] + rawImageData.data[fp+2]) / 2;
            // console.log( rawImageData.data[fp], rawImageData.data[fp+1], rawImageData.data[fp+2] );
            if(binary[binary_idx] == "0"){
                console.log("0");
                rawImageData.data[fp] = 255;
                // binary_idx++;
            }else if(binary[binary_idx] == "1"){
                console.log("1");
                rawImageData.data[fp] = 0;
                // binary_idx++;
            }else if(binary[binary_idx] == " "){
                console.log("1");
                rawImageData.data[fp] = 127;
                // binary_idx++;
            }



            if(clock_index%clockInterval === 0){
                console.log("clock strikes again --");
                clock_index = 0
                clock = Math.abs(clock - 255);
                binary_idx++;
            }
            clock_index++;
            rawImageData.data[0] = clock;


            if(binary_idx > binary.length -1){
                binary_idx = 0;
            }



            //
            // console.log( "new:");
            // console.log( rawImageData.data[fp], rawImageData.data[fp+1], rawImageData.data[fp+2] );
            // console.log( "---");

            // ----------------------------------------------------------------------------------------
            // ----------------------------------------------------------------------------------------

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
var h = 120; // 240 or 120 etc.
// taiwan port
// var stream = request("http://117.56.116.103/mjpg/video.mjpg").pipe(consumer).pipe(writer);
// taiwan entrance
// var stream = request("http://114.33.6.120:10000/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// taiwan messy room
// var stream = request("http://1.34.197.140:10000/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// spain house
// var stream = request("http://95.19.61.157:83/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);

// beach brazil
// http://187.8.158.90/mjpg/video.mjpg?COUNTER

// light tower
// var stream = request("http://75.134.86.115/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// motorway
// var stream = request("http://166.154.145.84/mjpg/video.mjpg?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);
// windmill
var stream = request("http://107.1.228.34/axis-cgi/mjpg/video.cgi?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);



// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------



var express = require('express');

var server = express();
server.use('/public', express.static(__dirname + '/public'));

server.get('/stream', function(req, res){
        mjpegReqHandler = mjpegServer.createReqHandler(req, res);

        var timer = setInterval(updateJPG, 50);
        var frameCount = 0;
        var timer = setInterval(function(){
            changes = true;
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
          //   mjpegReqHandler.close();
        }
});

server.get('/my_script.js', function(req, res){
    console.log(__dirname + '/my_script.js');
  res.sendFile(__dirname + '/my_script.js');
});

server.get('/', function(req, res){
    console.log(__dirname + '/index.html');
  res.sendFile(__dirname + '/index.html');
});


var starter = setInterval(function(){
    if(files.length >= maxNum - 1){
        console.log("ready to serve");
        clearInterval(starter);

        var port = 1805;
        server.listen(port, function() {
          console.log('server listening on port ' + port);
        });
    }
}, 500);

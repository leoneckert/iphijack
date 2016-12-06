var request = require("request");
var MjpegConsumer = require("mjpeg-consumer");
var FileOnWrite = require("file-on-write");
var http = require('http');
var fs = require('fs');
var mjpegServer = require('node-mjpeg-server');
var jpeg = require('jpeg-js');

// database stuff:
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ipggybackDB');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', function() {
  console.log("open");
});

var message = mongoose.Schema({
    name: Number,
    x: Number,
    y: Number,
    text: String,
    binary: String,
    idx: Number
});

var TheDB = mongoose.model('TheDB', message);

// var db;
// TheDB.find({}, function(err, res){
//     db = res;
// });



// ABC - a generic, native JS (A)scii(B)inary(C)onverter.
// (c) 2013 Stephan Schmitz <eyecatchup@gmail.com>
// License: MIT, http://eyecatchup.mit-license.org
// URL: https://gist.github.com/eyecatchup/6742657
var ABC={toAscii:function(a){return a.replace(/\s*[01]{8}\s*/g,function(a){return String.fromCharCode(parseInt(a,2))})},toBinary:function(a,b){return a.replace(/[\s\S]/g,function(a){a=ABC.zeroPad(a.charCodeAt().toString(2));return!1==b?a:a+" "})},zeroPad:function(a){return"00000000".slice(String(a).length)+a}};

var rawImageData;

function getPixelIdx(w,x,y){
    return (w * 4 * y) + (x * 4);
}
function getPixelXY(w,idx){
    var x = (idx/4)%w;
    var y = ((idx/4)-x)/w;
    return {x:x,y:y}
}

var stored = {};
stored[getPixelIdx(176,30,30)] = {
    x: 30,
    y: 30,
    text: "Leon ",
    binary: "01001100 01100101 01101111 01101110 00100000 ",
    idx: 0
}
// stored[getPixelIdx(176,30,30)] = {
//     x: 111,
//     y: 76,
//     text: "ITP ",
//     binary: "01001001 01010100 01010000 00100000 ",
//     idx: 0
// }
// stored[String(72)+"-"+String(99)] = {
//     x: 72,
//     y: 99,
//     text: "Hello Chino ",
//     binary: "01001000 01100101 01101100 01101100 01101111 00100000 01000011 01101000 01101001 01101110 01101111 00100000 ",
//     idx: 0
// }
// stored[String(42)+"-"+String(35)] = {
//     x: 42,
//     y: 35,
//     text: "This text is decoded from the pixel values ",
//     binary: "01010100 01101000 01101001 01110011 00100000 01110100 01100101 01111000 01110100 00100000 01101001 01110011 00100000 01100100 01100101 01100011 01101111 01100100 01100101 01100100 00100000 01100110 01110010 01101111 01101101 00100000 01110100 01101000 01100101 00100000 01110000 01101001 01111000 01100101 01101100 00100000 01110110 01100001 01101100 01110101 01100101 01110011 00100000 ",
//     idx: 0
// }


// clock:
var clock_binary ="10101010101010101010";
var clockInterval = 15;
var clock_index = 0;
var clock = 0;

// streaming stuff
var dir = 'video'
var imgDir = './' + dir;
var filename_i = 0;
var files = [];
var changes = false;
var changesObject = {};
var maxNum = 10;

var writer = new FileOnWrite({
    path: imgDir,
    ext: '.jpg',
    filename: function(){
        var filename = (filename_i > maxNum*2) ? filename_i = 0 : ++filename_i;

        if(files.length <= maxNum){
            files.push(filename);
        }else{
            while(files.length > maxNum){
                var del = files.shift();
                fs.unlink(imgDir+"/"+del+".jpg", function(){});
            }
            files.push(filename);
        }

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


            // // --------------------------------------------
            // // ---------- manipulate pixel here:
            // TheDB.find({}, function(err, db){
            // //     console.log(JSON.stringify(db, null, 3));
            //     for(var i = 0; i < db.length; i++){
            //         // console.log(db[i]);
            //         var msgObject = db[i];
            //         var fp = msgObject.name;
            //         // var x = msgObject.x;
            //         // var y = msgObject.y;
            //         // var text = msgObject.text;
            //         var binary = msgObject.binary;
            //         var idx = msgObject.idx;
            //
            //         var av = (rawImageData.data[fp + 1] + rawImageData.data[fp + 2]) / 2;
            //         var ch = 40; //changevalue
            //         var f = 1; //direction of adjustment
            //         if(av > 127 ){
            //             f = -1;
            //         }
            //
            //         //     // console.log(rawImageData.data[fp], " ", rawImageData.data[fp+1], " ", rawImageData.data[fp+2]);
            //         //
            //         if(binary[idx] == " "){
            //             console.log(" ");
            //             // rawImageData.data[fp] = 127;
            //             rawImageData.data[fp] = av;
            //             // binary_idx++;
            //         }else if(binary[idx] == "0"){
            //             console.log("0");
            //             // rawImageData.data[fp] = 255;
            //             rawImageData.data[fp] = av + (ch*f);
            //             // binary_idx++;
            //         }else if(binary[idx] == "1"){
            //             console.log("1");
            //             rawImageData.data[fp] = av + (ch*f) + (ch*f);
            //             // binary_idx++;
            //         }
            //             // console.log(rawImageData.data[fp], " ", rawImageData.data[fp+1], " ", rawImageData.data[fp+2]);
            //             // console.log("-");
            //     }
            //
            //     if(clock_index%clockInterval === 0){
            //         // console.log("clock strikes again --");
            //         clock_index = 0
            //         clock = Math.abs(clock - 255);
            //
            //         console.log("in clock");
            //         // increase each data pixels input
            //         for(var i = 0; i < db.length; i++){
            //             console.log(db[i]);
            //             // var this_pixel = stored[pixelsToChange[i]];
            //             db[i].idx++;
            //             if(db[i].idx > db[i].binary.length-1){
            //                 db[i].idx = 0;
            //             }
            //         }
            //     }
            //     clock_index++;
            //     rawImageData.data[0] = clock;
            //
            // });
            // // ----------------------------------------------------------------------------------------
            // // ----------------------------------------------------------------------------------------
            //
            // newJPG = jpeg.encode(rawImageData, 100);
            // // return newJPG.data;
            // callback(newJPG.data);



            var pixelsToChange = Object.keys(stored);

            for(var i = 0; i < pixelsToChange.length; i++){
                var this_pixel = stored[pixelsToChange[i]]
                var fp = pidx(rawImageData.width, rawImageData.height, this_pixel.x, this_pixel.y, 0);
                var binary = this_pixel.binary;
                var idx = this_pixel.idx;
                var av = (rawImageData.data[fp + 1] + rawImageData.data[fp + 2]) / 2;

                var ch = 40; //changevalue
                var f = 1; //direction of adjustment
                if(av > 127 ){
                    f = -1;
                }

                // console.log(rawImageData.data[fp], " ", rawImageData.data[fp+1], " ", rawImageData.data[fp+2]);

                if(binary[idx] == " "){
                    // console.log("1");
                    // rawImageData.data[fp] = 127;
                    rawImageData.data[fp] = av;
                    // binary_idx++;
                }else if(binary[idx] == "0"){
                    // console.log("0");
                    // rawImageData.data[fp] = 255;
                    rawImageData.data[fp] = av + (ch*f);
                    // binary_idx++;
                }else if(binary[idx] == "1"){
                    // console.log("1");
                    rawImageData.data[fp] = av + (ch*f) + (ch*f);
                    // binary_idx++;
                }
                // console.log(rawImageData.data[fp], " ", rawImageData.data[fp+1], " ", rawImageData.data[fp+2]);
                // console.log("-");
            }

            // ----------------------------------------------------------------------
            // clock business here

            if(clock_index%clockInterval === 0){
                // console.log("clock strikes again --");
                clock_index = 0
                clock = Math.abs(clock - 255);


                // increase each data pixels input
                for(var i = 0; i < pixelsToChange.length; i++){
                    var this_pixel = stored[pixelsToChange[i]];
                    this_pixel.idx++;
                    if(this_pixel.idx > this_pixel.binary.length-1){
                        this_pixel.idx = 0;
                    }
                }
            }
            clock_index++;
            rawImageData.data[0] = clock;


            // ----------------------------------------------------------------------------------------
            // ----------------------------------------------------------------------------------------

            newJPG = jpeg.encode(rawImageData, 100);
            // return newJPG.data;
            callback(newJPG.data);
        }
        catch(e) {
            console.log(e);
            console.log("err");
            callback(data);
        }
    }
});



//////////////
////STREAM////
//////////////
var consumer = new MjpegConsumer();
var w = 176; // 320 or 160 etc.   352, 176
var h = 120; // 240 or 120 etc.   240, 120
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
// var stream = request("http://107.1.228.34/axis-cgi/mjpg/video.cgi?resolution="+w+"x"+h+"&camera=1").pipe(consumer).pipe(writer);

//new york
var stream = request("http://23.246.89.122:81/mjpg/video.mjpg?resolution="+w+"x"+h).pipe(consumer).pipe(writer);

// http://23.246.89.122:81/mjpg/video.mjpg?camera=1&resolution=352x240

// ----------------------------------------------------------------------------------------------------------------
// ----------------------------------------------------------------------------------------------------------------

var express = require('express');

var server = express();
server.use('/public', express.static(__dirname + '/public'));

server.get('/stream1', function(req, res){

        // changesObject[myID] = true;

        mjpegReqHandler = mjpegServer.createReqHandler(req, res);

        var timer = setInterval(updateJPG, 30);
        // var frameCount = 0;
        // var timer = setInterval(function(){
        //     // changes = true;
        //     if(changes){
        //         changes = false;
        //         // console.dir(changesObject);
        //         if(frameCount % 1000 == 0){
        //             console.log("frames:" + frameCount);
        //         }
        //         frameCount++;
        //         updateJPG();
        //     }
        // }, 10);

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

var MjpegProxy = require('mjpeg-proxy').MjpegProxy;
server.get('/stream', new MjpegProxy('http://localhost:1805/stream1').proxyRequest);


server.get('/my_script.js', function(req, res){
    console.log(__dirname + '/my_script.js');
  res.sendFile(__dirname + '/my_script.js');
});

server.get('/loadingImg', function(req, res){
    console.log(__dirname + '/loading_img.png');
  res.sendFile(__dirname + '/loading_img.png');
});

server.get('/encodeReq', function(req, res){
    console.log("req");
    var name = Object.keys(req.query)[0];
    console.log(name);
    var x = getPixelXY(176, parseInt(name)).x;
    var y = getPixelXY(176, parseInt(name)).y
    // console.log( getPixelXY(176, parseInt(name)).x );
    // console.log( getPixelXY(176, parseInt(name)).y );
    var text = "renata was here" + " ";
    // console.log("|here is data" + " |");
    var binary = " " + ABC.toBinary("renata was here" + " ");
    // console.log("|"+ABC.toBinary("here is data" + " ") + "|");
    // console.log("idx=0");
    // stored[name] = {
    //     x: x,
    //     y: y,
    //     text: text,
    //     binary: binary,
    //     idx: 0
    // }
    //
    // console.log("stored changed");
    // console.log(stored);


  // res.sendFile(__dirname + '/loading_img.png');
});


server.get('/', function(req, res){
    console.log(__dirname + '/index.html');
  res.sendFile(__dirname + '/index.html');
});

server.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})


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

// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
var streamW = 160;
var streamH = 120;

// var inspectX = null;
// var inspectY = null;
var inspectX = 10;
var inspectY = 10;


function getPixelIdx(w,x,y){
    return (w * 4 * y) + (x * 4);
}
function getMarker(w,x,y){
    // square around spot:
    var sq = [];
    for(var i = -2; i <= 2; i+=2){
        for(var j = -2; j <= 2; j+=2){
            sq.push( getPixelIdx(w,x+i,y+j) );
        }
    }
    // var sq = [getPixelIdx(w,x-2,y), getPixelIdx(w,x-2,y-1), getPixelIdx(w,x-2,y-2)];
    return sq;
}
function isInArray(value, array) {
  return array.indexOf(value) > -1;
}

function allocateElement(idx, callback){
    var idx_id = String(idx);
    var elem = document.getElementById(idx_id);
    if( elem == null){
        elem = document.createElement('div');
        elem.id = idx_id;
        document.getElementById("data").appendChild(elem);

        var rgb = document.createElement('div');
        rgb.id = "rgb";
        elem.appendChild(rgb);

        var coordinates = document.createElement('div');
        coordinates.id = "coordinates";
        elem.appendChild(coordinates);

        var binary = document.createElement('div');
        binary.id = "binary";
        elem.appendChild(binary);



        callback(elem);
    }else{
        callback(elem);
    }
}
function addToLog(idx, r, g, b){
    allocateElement(idx, function(elem){
        // console.log(elem);
        elem.style.display = "block"

        // rgb
        var rgb = elem.childNodes[0];

        var str = r + " | " + g + " | " + b;
        var p = document.createElement('p');
        p.innerHTML = str;
        rgb.innerHTML = "";
        rgb.appendChild(p);

        // coordinates
        var coordinates = elem.childNodes[1];

        str = inspectX + " | " + inspectY;
        var p2 = document.createElement('p');
        p2.innerHTML = "";
        coordinates.innerHTML = str;
        coordinates.appendChild(p2);

        // binary
        var binary = elem.childNodes[2];
        // var av = (parseInt(g) + parseInt(b)) /2;
        var v = parseInt(r);
        // var re = av - v;
        if(v < 127){
            binary.innerHTML += "1";
        }else if(v > 127){
            binary.innerHTML += "0";
        }
        // debugger
        // binary.innerHTML += "1";

    });

}


function init(){
    var image = new Image();
    var loadingImg = new Image();
    loadingImg.src = "http://files.leoneckert.com/ididntknow.gif"

    // create the canvas to render to
    var canvas = document.createElement('canvas');
    canvas.width = streamW;
    canvas.height = streamH;
    canvas.style.background = 'rgb(255, 255,255)';
    document.getElementById("canvasWrapper").appendChild(canvas);
    var context = canvas.getContext('2d');

    var picker = document.createElement('div');
    picker.style.width = streamW/2 + "px";
    picker.style.height = streamW/2 + "px";
    picker.style.background = 'rgb(255, 0, 255)';
    document.getElementById("canvasWrapper").appendChild(picker);

    var pickerExit = document.createElement('a');
    pickerExit.innerHTML = "x";
    pickerExit.href = "#";
    pickerExit.style.display = "none";
    document.getElementById("canvasWrapper").appendChild(pickerExit);
    // var imgd = context.getImageData(20, 20, 2, 2);
    // console.log(imgd);

    var drawInterval = Math.max(1 / 10 * 1000, 30);
    console.log("drawInterval", drawInterval);

    function changeStream(){
        var src = 'http://lke229.itp.io:1805/stream';
        image.src = src;
    }

    function draw() {
        // clear the canvas
        canvas.width = canvas.width;
        // check if we have a valid image
        if (image.width * image.height > 0) {
          context.drawImage(image, 0, 0, streamW, streamH);
        } else {
        //   context.drawImage(loadingImg, 0, 0, streamW, streamH);
        }

        var selectedI = null;
        var marker = null;
        if(inspectY != null && inspectX != null){
            selectedI = getPixelIdx(streamW, inspectX, inspectY);
            marker = getMarker(streamW, inspectX, inspectY);
        }

        imgd = context.getImageData(0, 0, streamW, streamH);


        pix = imgd.data;
        // Loop over each pixel and invert the color.
        for (var i = 0, n = pix.length; i < n; i += 4) {
            if(selectedI != null){
                if(i == selectedI){
                    picker.style.background = 'rgb('+pix[i]+', '+pix[i+1]+', '+pix[i+2]+')';
                    picker.style.border = '1px solid black';
                    addToLog(selectedI, pix[i], pix[i+1], pix[i+2]);
                }else if(isInArray(i, marker)){
                    // picker.style.background = 'rgb(255, 0, 0)';
                    pix[i  ] = 255; // red
                    pix[i+1] = 0; // green
                    pix[i+2] = 0; // blue
                }else{
                    pix[i+3] = 200; // alpha (the fourth element)
                }
            }else{
                picker.style.background = 'rgb(255, 255, 255)';
                picker.style.border = 'none';
                document.getElementById('data').innerHTML = "";
            }

        }
        context.putImageData(imgd, 0, 0);

    }



    //CLICK EVENTS:

    // from here: http://stackoverflow.com/a/10036499
    var mouseIsDown = false;
    canvas.onmousedown = function(e){
        mouseIsDown = true;
    }
    canvas.onmouseup = function(e){
        if(mouseIsDown) mouseClick(e);
        mouseIsDown = false;
    }
    canvas.onmousemove = function(e){
        if(!mouseIsDown) return;
        mouseClick(e);
        return false;
    }
    function mouseClick(e){
        inspectX = e.layerX;
        inspectY = e.layerY;
        pickerExit.style.display = "block";
        document.getElementById('data').innerHTML = "";
    }
    pickerExit.addEventListener('click', function(){
        inspectX = null;
        inspectY = null;
        pickerExit.style.display = "none";
        document.getElementById('data').innerHTML = "";

    });

    // RUN IT ALL:

    changeStream();

    var changeTestCanvas = document.createElement('canvas');
    changeTestCanvas.width = streamW;
    changeTestCanvas.height = streamH;
    changeTestCanvas.style.background = 'rgb(255, 255,255)';
    // document.getElementById("canvasWrapper").appendChild(changeTestCanvas);
    var changeTestCanvasContext = changeTestCanvas.getContext('2d');

    var preClock = 0;
    setInterval(function(){
        changeTestCanvasContext.drawImage(image, 0, 0, streamW, streamH);
        var clock = changeTestCanvasContext.getImageData(0, 0, 1, 1).data[0];
        console.log(clock);
        if(Math.abs(clock-preClock) > 100){
            console.log("drawing");
        }
        preClock = clock;
    }, 2);

    // while(true){
    //
    // }

    // setInterval(draw, drawInterval);
    // setInterval(draw, 2);

}

window.addEventListener("load", init);

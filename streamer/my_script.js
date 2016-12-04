// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
var streamW = 160;
var streamH = 120;

var inspectX = null;
var inspectY = null;

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
            var name = String(idx);
            var elem = document.getElementById(name);
            if( elem == null){
                elem = document.createElement('div');
                elem.id = name;
                elem.className = 'pixelData';
                document.getElementById("canvasWrapper").appendChild(elem);
                callback(elem);
            }else{
                callback(elem);
            }

        }


        function addToLog(idx, r, g, b){
            allocateElement(idx, function(elem){
                elem.style.display = "block"
                // console.log(elem, "got");
                var str = r + " | " + g + " | " + b + " | ";
                var p = document.createElement('p');
                p.innerHTML = str;
                elem.appendChild(p);

            });

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
                var pixelDataDivs = document.getElementsByClassName("pixelData");
                console.log(pixelDataDivs);

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
    }
    pickerExit.addEventListener('click', function(){
        inspectX = null;
        inspectY = null;
        pickerExit.style.display = "none";
        var pixelDataDivs = document.getElementsByClassName("pixelData");
        console.log(pixelDataDivs);
        // for(var i = 0; i < pixelDataDivs.length; i++){
        //     pixelDataDivs[i].style.display = "none";
        // }

    });

    // RUN IT ALL:

    changeStream();
    console.log(image);
    setInterval(draw, drawInterval);

}

window.addEventListener("load", init);

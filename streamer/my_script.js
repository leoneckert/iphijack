// ABC - a generic, native JS (A)scii(B)inary(C)onverter.
// (c) 2013 Stephan Schmitz <eyecatchup@gmail.com>
// License: MIT, http://eyecatchup.mit-license.org
// URL: https://gist.github.com/eyecatchup/6742657
var ABC={toAscii:function(a){return a.replace(/\s*[01]{8}\s*/g,function(a){return String.fromCharCode(parseInt(a,2))})},toBinary:function(a,b){return a.replace(/[\s\S]/g,function(a){a=ABC.zeroPad(a.charCodeAt().toString(2));return!1==b?a:a+" "})},zeroPad:function(a){return"00000000".slice(String(a).length)+a}};


// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
var streamW = 176;
var streamH = 120;

// var inspectX = null;
// var inspectY = null;
var inspectX = 42;
var inspectY = 35;


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
        elem.className = "dataBox";
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

        var ascii = document.createElement('div');
        ascii.id = "ascii";
        elem.appendChild(ascii);

        callback(elem);
    }else{
        callback(elem);
    }
}
function addToLog(idx, r, g, b){
    allocateElement(idx, function(elem){
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
        p2.innerHTML = str;
        coordinates.innerHTML = "";
        coordinates.appendChild(p2);
    });
}

function addToBinary(idx, newValue){
    var str = "";
    if(newValue === 2){
        str = " ";
    }else{
        str = String(newValue);
    }
    allocateElement(idx, function(elem){
        var binary = elem.childNodes[2];
        var old_str = binary.innerHTML;
        var new_str = old_str += str;

        var parts = new_str.split(" ");

        var ascii_str = "";
        for(var i = 0; i < parts.length-1; i++){
            if(!parts[i].startsWith("<")){

                if(parts[i].length != 8){
                    parts[i] = "<strike>"+parts[i]+"</strike>";
                }else{
                    ascii_str += ABC.toAscii(parts[i]);

                }

            }
        }
        var processedstring = parts.join(" ");
        binary.innerHTML = processedstring;

        var ascii = elem.childNodes[3];
        ascii.innerHTML = "<b>"+ascii_str+"</b>";




        // var str = binary.childNodes[0].innerHTML;
        // var p = document.createElement('p');
        // p.innerHTML = str()
        //
        // // p.innerHTML = "";
        // // coordinates.innerHTML = str;
        // coordinates.appendChild(p);

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

    var clock = 0;
    var preClock = 255;
    var currentbinary = [];
    var binary_str = ""

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
          context.drawImage(loadingImg, 0, 0, streamW, streamH);
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
                    // console.log(pix[i]);
                    picker.style.background = 'rgb('+pix[i]+', '+pix[i+1]+', '+pix[i+2]+')';
                    picker.style.border = '1px solid black';
                    pickerExit.style.display = "block";
                    addToLog(selectedI, pix[i], pix[i+1], pix[i+2]);

                    var av = (pix[i+1] + pix[i+2])/2;
                    var ch = 40; //changevalue
                    var f = 1; //direction of adjustment, think i dont need on this side because using Math.abs
                    if(av > 127 ){
                        f = -1;
                    }
                    if(  Math.abs(pix[i] - av) < ch/2 ){
                        currentbinary.push(2);
                    }else if(Math.abs(pix[i] - av) < ch + ch/2 ){
                        currentbinary.push(0);
                    }else if(Math.abs(pix[i] - av) < ch*2 + ch/2 ){
                        currentbinary.push(1);
                    }

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




        clock = pix[0];
        if(Math.abs(clock-preClock) > 100){
            console.log("clock strikes");
            preClock = clock;

            if(selectedI != null){
                var sum = 0;
                for( var i = 0; i < currentbinary.length; i++ ){
                    sum += parseInt(currentbinary[i]); //don't forget to add the base
                }
                var avg = Math.round(sum/currentbinary.length);

                addToBinary(selectedI, avg);

                currentbinary = [];
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
        // pickerExit.style.display = "block";
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

    // var preClock = 0;
    // setInterval(function(){
    //     changeTestCanvasContext.drawImage(image, 0, 0, streamW, streamH);
    //     var clock = changeTestCanvasContext.getImageData(0, 0, 1, 1).data[0];
    //     console.log(clock);
    //     if(Math.abs(clock-preClock) > 100){
    //         console.log("drawing");
    //         draw();
    //     }
    //     preClock = clock;
    // }, 80);

    // while(true){
    //
    // }

    // setInterval(draw, drawInterval);
    setInterval(draw, 2);

}

window.addEventListener("load", init);
//

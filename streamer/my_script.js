// ABC - a generic, native JS (A)scii(B)inary(C)onverter.
// (c) 2013 Stephan Schmitz <eyecatchup@gmail.com>
// License: MIT, http://eyecatchup.mit-license.org
// URL: https://gist.github.com/eyecatchup/6742657
var ABC={toAscii:function(a){return a.replace(/\s*[01]{8}\s*/g,function(a){return String.fromCharCode(parseInt(a,2))})},toBinary:function(a,b){return a.replace(/[\s\S]/g,function(a){a=ABC.zeroPad(a.charCodeAt().toString(2));return!1==b?a:a+" "})},zeroPad:function(a){return"00000000".slice(String(a).length)+a}};


// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
var streamW = 176;
var streamH = 120;

var inspectX = null;
var inspectY = null;
// var inspectX = 18;
// var inspectY = 5;


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

        var coordinates = document.createElement('div');
        coordinates.id = "coordinates";
        elem.appendChild(coordinates);

        var rgb = document.createElement('div');
        rgb.id = "rgb";
        elem.appendChild(rgb);


        var binary = document.createElement('div');
        binary.id = "binary";
        elem.appendChild(binary);

        var ascii = document.createElement('div');
        ascii.id = "ascii";
        elem.appendChild(ascii);

        var notification = document.createElement('div');
        notification.id = "notification";
        elem.appendChild(notification);

        var input = document.createElement("input");
        input.type = "text";
        input.id = "text_"+idx_id;
        elem.appendChild(input);

        var button = document.createElement("button");
        button.innerHTML = "encode a message";
        button.style.marginTop = "14px";
        elem.appendChild(button);
        button.addEventListener ("click", function() {

            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("POST", "encodeReq", true);
            var toSend = {"pixid":idx_id, "text": document.getElementById("text_"+idx_id).value + " "};
            xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xmlhttp.onreadystatechange = function() {//Call a function when the state changes.
                if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    console.log(xmlhttp.responseText);
                    var r = xmlhttp.responseText;
                    notification.innerHTML = "";
                    if(r != "charlimit"){
                        button.style.display = "none";
                        input.style.display = "none";
                    }
                    notification.style.color = "red";
                    if(r == "success"){
                        notification.style.color = "green";
                        notification.innerHTML = "Thanks! Your message is encoded. Give it a little moment though.";
                    }else if(r == "clock"){
                        notification.innerHTML = "Sorry, this pixel keeps this thing running.";
                    }else if(r == "occupied"){
                        notification.innerHTML = "Sorry, seems like this pixel carries a message already.";
                    }else if(r == "charlimit"){
                        notification.innerHTML = "Sorry, messages should not be longer than 140 characters.";
                    }


                }
            }
            xmlhttp.send(JSON.stringify(toSend))

        });

        callback(elem);
    }else{
        callback(elem);
    }
}
function addToLog(idx, r, g, b){
    allocateElement(idx, function(elem){
        elem.style.display = "block"


        // coordinates
        var coordinates = elem.childNodes[0];
        str = "<i>xy:</i> " + inspectX + " " + inspectY;
        var p2 = document.createElement('p');
        p2.innerHTML = str;
        coordinates.innerHTML = "";
        coordinates.appendChild(p2);

        // rgb
        var rgb = elem.childNodes[1];
        var str = "<i>rgb:</i> " + r + " " + g + " "  +  b;
        var p = document.createElement('p');
        p.innerHTML = str;
        rgb.innerHTML = "";
        rgb.appendChild(p);


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
        if(old_str.length === 0){
            old_str = "<i>binary:</i> "
        }
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
        ascii.innerHTML = "<i>message:</i> <b>"+ascii_str+"</b>";




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
    loadingImg.src = "http://localhost:1805/loadingImg"

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
    pickerExit.innerHTML = "<i>exit</i>";
    pickerExit.href = "#";
    pickerExit.style.display = "none";
    pickerExit.style.fontSize = "0.8em";
    pickerExit.style.marginTop = "2px";
    document.getElementById("canvasWrapper").appendChild(pickerExit);

    var drawInterval = Math.max(1 / 10 * 1000, 30);
    console.log("drawInterval", drawInterval);

    var clock = 0;
    var preClock = 255;
    var currentbinary = [];
    var binary_str = ""

    function changeStream(){
        var src = 'http://localhost:1805/stream';
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

                    var tp = null // targetPixel
                    var sp = null // second pixel
                    var lp = null // last pixel

                    if(i%3 === 0){
                        tp = 0 // targetPixel
                        sp = 1 // second pixel
                        lp = 2 // last pixel
                    } else if(i%3 === 1){
                        tp = 2 // targetPixel
                        sp = 0 // second pixel
                        lp = 1 // last pixel
                    }else if(i%3 === 2){
                        tp = 1 // targetPixel
                        sp = 2 // second pixel
                        lp = 0 // last pixel
                    }


                    var av = (pix[i+sp] + pix[i+lp])/2;
                    var ch = 40; //changevalue
                    var f = 1; //direction of adjustment, think i dont need on this side because using Math.abs
                    if(av > 127 ){
                        f = -1;
                    }
                    if(  Math.abs(pix[i+tp] - av) < ch/2 ){
                        currentbinary.push(2);
                    }else if(Math.abs(pix[i+tp] - av) < ch + ch/2 ){
                        currentbinary.push(0);
                    }else if(Math.abs(pix[i+tp] - av) < ch*2 + ch/2 ){
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

    setInterval(draw, 2);

    document.getElementById("info").addEventListener('click', function(){
        document.getElementById("infotext").style.display = "block";
        document.getElementById("info").style.display = "none";
    });
    document.getElementById("hideinfo").addEventListener('click', function(){
        document.getElementById("infotext").style.display = "none";
        document.getElementById("info").style.display = "block";
    });

}

window.addEventListener("load", init);
//

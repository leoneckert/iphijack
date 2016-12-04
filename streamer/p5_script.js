// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
function init(){
    var image = new Image();
    var loadingImg = new Image();
    loadingImg.src = "http://files.leoneckert.com/ididntknow.gif"

    // create the canvas to render to
    var canvas = document.createElement('canvas');
    canvas.width = 160;
    canvas.height = 120;
    canvas.style.background = 'rgb(255, 0,0)';
    document.getElementById("canvasWrapper").appendChild(canvas);
    var context = canvas.getContext('2d');

    var drawInterval = Math.max(1 / 10 * 1000, 30);
    console.log("drawInterval", drawInterval);

    function changeStream(){
        var src = 'http://lke229.itp.io:1805/stream';
        image.src = src;
    }

    function draw() {
        // // clear the canvas
        // canvas.width = canvas.width;
        //
        // // check if we have a valid image
        // if (image.width * image.height > 0) {
        //   context.drawImage(image, 0, 0, 160, 120);
        // } else {
        //   // center the error icon
        //   context.drawImage(loadingImg, 0, 0, 160, 120);
        // //   that.emit('warning', 'Invalid stream.');
        // }

        context.drawImage(loadingImg, 0, 0, 160, 120);

        // // silly firefox...
        // if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
        //   var aux = that.image.src.split('?killcache=');
        //   that.image.src = aux[0] + '?killcache=' + Math.random(42);
        // }
      }

    changeStream();
    console.log(image);
    draw();


}



window.addEventListener("load", init);

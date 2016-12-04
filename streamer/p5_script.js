// inspo from here: https://github.com/rctoris/mjpegcanvasjs/blob/develop/src/visualization/Viewer.js
function init(){
    var image = new Image();

    // create the canvas to render to
  var canvas = document.createElement('canvas');
  canvas.width = this.width;
  canvas.height = this.height;
  canvas.style.background = '#aaaaaa';
  document.getElementById("canvasWrapper").appendChild(canvas);
  var context = canvas.getContext('2d');

  // var drawInterval = Math.max(1 / this.refreshRate * 1000, this.interval);

    function changeStream(){
        var src = 'http://lke229.itp.io:1805/stream';
        image.src = src;
    }

    // function draw() {
    //     // clear the canvas
    //     that.canvas.width = that.canvas.width;
    //
    //     // check if we have a valid image
    //     if (that.image.width * that.image.height > 0) {
    //       context.drawImage(that.image, 0, 0, that.width, that.height);
    //     } else {
    //       // center the error icon
    //       context.drawImage(errorIcon.image, (that.width - (that.width / 2)) / 2,
    //           (that.height - (that.height / 2)) / 2, that.width / 2, that.height / 2);
    //       that.emit('warning', 'Invalid stream.');
    //     }
    //
    //     // check for an overlay
    //     if (overlay) {
    //       context.drawImage(overlay, 0, 0);
    //     }
    //
    //     // silly firefox...
    //     if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
    //       var aux = that.image.src.split('?killcache=');
    //       that.image.src = aux[0] + '?killcache=' + Math.random(42);
    //     }
    //   }

    changeStream();
    console.log(image);


}



window.addEventListener("load", init);

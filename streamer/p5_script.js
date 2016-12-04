
function init(){
    var image = new Image();

    function changeStream(){
        // create the image to hold the stream
        var src = 'http://localhost:1805/stream';
        // // add various options
        // src += '&width=' + this.width;
        // src += '&height=' + this.height;
        // if (this.quality > 0) {
        //   src += '&quality=' + this.quality;
        // }
        // if (this.invert) {
        //   src += '&invert=' + this.invert;
        // }
        image.src = src;
        // emit an event for the change
        // this.emit('change', topic);
    }

    changeStream();
    console.log(image);


}



window.addEventListener("load", init);

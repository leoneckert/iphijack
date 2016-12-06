// tutorial: http://mongoosejs.com/docs/
// mongod
// mongo
// show dbs
// use blabla (to use or create)
// db.dropDatabase() (after using it to delete it)

// on digitalocean installed this way: http://fearby.com/installing-mongodb-onto-a-digital-ocean-ubuntu-14-04-server/


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

var Message = mongoose.model('Message', message);

// stored[getPixelIdx(176,30,30)] = {
//     x: 30,
//     y: 30,
//     text: "Leon ",
//     binary: "01001100 01100101 01101111 01101110 00100000 ",
//     idx: 0
// }

var msg = new Message(
    {
        name: 12132,
        x: 30,
        y: 30,
        text: "Leon ",
        binary: "01001100 01100101 01101111 01101110 00100000 ",
        idx: 0
    }
)

msg.save(function (err) {
  if (err) return console.error(err);
});

Message.find({}, function(err, res){
    console.dir(res);
});

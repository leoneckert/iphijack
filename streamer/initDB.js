// tutorial: http://mongoosejs.com/docs/
// mongod
// mongo
// show dbs
// use blabla (to use or create)
// db.dropDatabase() (after using it to delete it)

// on digitalocean installed this way: http://fearby.com/installing-mongodb-onto-a-digital-ocean-ubuntu-14-04-server/
var mongoose = require('mongoose');
mongoose.connect('mongodb://leoneckert:itpnyu@ds127428.mlab.com:27428/ipiggybackdb');

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

var msg = new TheDB(
    {
        name: 3592,
        x: 18,
        y: 5,
        text: "first ",
        binary: "01100110 01101001 01110010 01110011 01110100 00100000 ",
        idx: 0
    }
)

msg.save(function (err) {
  if (err) return console.error(err);
});

TheDB.find({}, function(err, db){
    console.log(JSON.stringify(db, null, 3));
});

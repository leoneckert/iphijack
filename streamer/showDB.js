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

TheDB.find({}, function(err, db){
    console.log(JSON.stringify(db, null, 3));
});

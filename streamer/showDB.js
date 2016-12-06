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

Message.find({}, function(res){
    console.dir(res);
});

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');


var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
server.listen(8080);

/*
//serial to Arduino

var serialport = require('serialport');
portname = '/dev/cu.usbserial-DN01Q7W1';

var myPort = new serialport(portname,{
  baudRate: 115200,
  parser: serialport.parsers.readline("\n")
});

function arduinoData(data){
  console.log(data);
  var obj = {"value": markets[0].quantity};
  console.log('test VC');
  //io.sockets.emit('brandon',obj);
  console.log("already Sent!!");
  io.sockets.emit('unity',obj);

  if(data== 1){
    // console.log("emit 1");
    if ((markets[0].quantity >= markets[2].value) && (markets[2].value > 0)) {

      markets[2].quantity++;
      markets[0].quantity -=markets[2].value;
      var obj = {"value": 1};
      io.sockets.emit('unity',obj);
    // io.sockets.emit('brandon',obj);
    var obj2 = {"value": markets[0].quantity};
    io.sockets.emit('brandon',obj2);
      io.sockets.emit('updateQuantity', markets);
      // myPort.write("120"+ '\n');
    }
  }
  if(data== 2){
    // console.log("emit 2");
    if (markets[2].quantity > 0) {
      markets[2].quantity--;
      markets[0].quantity +=markets[2].value;
      var obj = {"value": 2};
      io.sockets.emit('unity',obj);
    //  io.sockets.emit('brandon',obj);
    var obj2 = {"value": markets[0].quantity};
    io.sockets.emit('brandon',obj2);
      io.sockets.emit('updateQuantity', markets);
      // myPort.write("150"+ '\n');
    }
  }

  if(data== 3){
    // console.log("emit 1");
    if ((markets[0].quantity >= markets[1].value) && (markets[1].value > 0)) {

      markets[1].quantity++;
      markets[0].quantity -=markets[1].value;

      var obj2 = {"value": markets[0].quantity};
      io.sockets.emit('brandon',obj2);

      io.sockets.emit('updateQuantity', markets);
      myPort.write("31"+ '\n');
    }
  }

  if(data== 4){
    // console.log("emit 2");
    if (markets[1].quantity > 0) {
      markets[1].quantity--;
      markets[0].quantity +=markets[1].value;


      var obj2 = {"value": markets[0].quantity};
      io.sockets.emit('brandon',obj2);

      io.sockets.emit('updateQuantity', markets);
      myPort.write("41"+ '\n');
    }
  }

  if(data== 5){
    // console.log("emit 1");
    if ((markets[0].quantity >= markets[3].value) && (markets[3].value > 0)) {

      markets[3].quantity++;
      markets[0].quantity -=markets[3].value;
      var obj2 = {"value": markets[0].quantity};
      io.sockets.emit('brandon',obj2);
      io.sockets.emit('updateQuantity', markets);
      myPort.write("51"+ '\n');
    }
    // else{
    //   myPort.write("52"+ '\n');///not enough money
    // }
  }

  if(data== 6){
    // console.log("emit 2");
    if (markets[3].quantity > 0) {
      markets[3].quantity--;
      markets[0].quantity +=markets[3].value;
      var obj2 = {"value": markets[0].quantity};
      io.sockets.emit('brandon',obj2);
      io.sockets.emit('updateQuantity', markets);
      myPort.write("61"+ '\n');
    }
  }
  // if(data == "1")
  // io.sockets.emit('buy', parseInt("2"));
  // socket.emit('sell', parseInt("2"));
  // serialBuy();

}


myPort.on('open',function(){
  console.log('port open');
});

myPort.on('data', arduinoData);

myPort.on('error', function(data){
  console.log('error');
});

///
*/

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var fs = require("fs");
function readJsonFileSync(filepath, encoding) {

  if (typeof (encoding) == 'undefined') {
    encoding = 'utf8';
  }
  var file = fs.readFileSync(filepath, encoding);
  return JSON.parse(file);
}

function getConfig(file) {

  var filepath = __dirname + '/' + file;
  return readJsonFileSync(filepath);
}
reset();
//assume that config.json is in application root
function reset() {
  markets = getConfig('markets.json');

}


io.sockets.on('connection', function (socket) {
  console.log('new client --' + socket.id);
  // io.sockets.emit('resetMarkets', markets);
  socket.on('reset', function (i) {
    reset();
    console.log('reset button clicked');
    io.sockets.emit('resetMarkets', markets);
  });
  /*
  socket.on('poolUpdate', function(data){
    //console.log('brandon got data');
    markets[data.market_id].value = data.value;
    // console.log(data.market_id);
    // console.log(data.value);
    ////////////////////////////////////////////////////////////////////////////////
  //  console.log(markets[0].quantity);
    var obj = {"value": markets[0].quantity};
    //io.sockets.emit('brandon',obj);
  });
*/
  socket.on('updateValue', function (data) {


    try {
      console.log(data);
      if (data.market_id == 0) {console.log(data.value);}
      markets[data.market_id].value = data.value;  //origin keyue file

    }
    catch (e) {
      console.log(e);
    }

    /*
    if (typeof data.isObject != "undefined" && data.isObject == true) {
      markets[data.market_id].value = data.value;
      console.log ('what is that ? = ' + data.value);
      if (data.value == 0) {
        markets[data.market_id].quantity = 0;
        console.log("Exploded");
        io.sockets.emit('updateQuantity', markets);
      }
    } else {

      // data[0].quantity is problem
      markets[0].quantity = data[0].quantity;
      io.sockets.emit('updateValue', data);
    }
*/
    ////////////////////////////////////////////////////////////////////////////////
    console.log(markets[0].quantity);
    var obj = { "value": markets[0].quantity };
    io.sockets.emit('unity', obj);
    //console.log('brandon update');
    io.sockets.emit('brandon', obj);
    ////////////////////////////////////////////////////////////////////////////////
    if (data.value == 0) {
      // data.value=10;
      markets[data.market_id].quantity = 0;
      // console.log("Exploded");

      if (data.market_id == 2) {
        var obj = { "value": 0 };
        io.sockets.emit('unity', obj);
        //io.sockets.emit('brandon',obj);
        console.log("solar sail exploded");

      }
      if (data.market_id == 4) {
        console.log("biomass exploded");
      }

      io.sockets.emit('updateQuantity', markets);
    }

  })
  socket.on('sell', function (i) {
    if (markets[i].quantity > 0) {

      markets[i].quantity--;

      markets[0].quantity += markets[i].value;
      //socket.emit('poolChange', markets[0].quantity);
      io.sockets.emit('updateQuantity', markets);
    }
  });
  socket.on('buy', function (i) {
    if ((markets[0].quantity >= markets[i].value) && (markets[i].value > 0)) {

      markets[i].quantity++;
      if (i == 1) {
        markets[0].quantity -= markets[i].initValue;
      } else {
         markets[0].quantity -= markets[i].value;
      }
     
      //socket.emit('poolChange', markets[0].quantity);
      io.sockets.emit('updateQuantity', markets);
    }

  });

  socket.on('disconnect', function () {
    console.log("disconnect");
  });
});


module.exports = app;

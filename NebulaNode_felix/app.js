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
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', index);
app.use('/users', users);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
server.listen(8080);
var fs = require("fs");

function readJsonFileSync(filepath, encoding) {
    if (typeof(encoding) == 'undefined') {
        encoding = 'utf8';
    }
    var file = fs.readFileSync(filepath, encoding);
    return JSON.parse(file);
}

function getConfig(file) {
    var filepath = __dirname + '/' + file;
    return readJsonFileSync(filepath);
}

var buyValue = 0;
var sellValue = 0;
reset();
//assume that config.json is in application root
function reset() {
    buyValue = 0;
    sellValue = 0;
    markets = getConfig('markets.json');
}

io.on('connection', function(socket) {
    socket.emit('resetMarkets', markets);
    socket.on('reset', function(i) {
        reset();
        io.sockets.emit('resetMarkets', markets);
    });
    socket.on('updateValue', function(data) {
        console.log(data);
        if (typeof data.isObject != "undefined" && data.isObject == true) {
            markets[data.market_id].value = data.value;
            if (data.value == 0) {
                markets[data.market_id].quantity = 0;
                console.log("Exploded");
                io.sockets.emit('updateQuantity', markets);
            }
        } else {
            markets[0].quantity = data[0].quantity;
            io.sockets.emit('updateValue', data);    
        }
    });
    socket.on('sell', function(i) {
        if (markets[i].quantity > 0) {
            markets[i].quantity--;
            markets[i].clicked = 'sell';
            markets[i].cylinder = sellValue++;

            if (i != 1) {
                markets[0].quantity += markets[i].value;
            }

            io.sockets.emit('updateQuantity', markets);
        }
    });
    socket.on('buy', function(i) {
        if ((markets[0].quantity >= markets[i].value) && (markets[i].value > 0)) {
            markets[i].quantity++;
            markets[0].quantity -= markets[i].value;
            markets[i].clicked = 'buy';
            markets[i].cylinder = buyValue++;
            io.sockets.emit('updateQuantity', markets);
        }
    });
});
module.exports = app;
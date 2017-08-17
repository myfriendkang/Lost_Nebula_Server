
var socket;
$(document).ready(function () {
	//socket = io.connect('http://192.168.1.139:8080');  //keyue ip address
	socket = io.connect('http://localhost:8080');

	//Add from Felix ----
	
	socket.on('updateValue', function(data) {
		console.log(data);
        updateQuantity(data);
    });
	//-------

	socket.on('updateQuantity', function (data) {

		updateQuantity(data);

	});
	socket.on('resetMarkets', function (data) {
		populateMarketControls(data)
	});
	socket.on('poolChange', function (value) {
		console.log(value);
		console.log('control _ value');
		$('#poolValue').html(value);
	});

	$('#reset').on('click', function (event) {
		socket.emit('reset');
	})
});

function updateQuantity(data) {
	$('#poolValue').html(data[0].quantity);
	for (var i = 1; i < data.length; i++) {

		$('#market' + i + ' h4').html(data[i].quantity);
	}
}
function populateMarketControls(data) {
	var divContent = '';
	for (var i = 0; i < data.length; i++) {
		var market = data[i];
		if (market.market_id == 0) {
			$('#poolValue').html(market.quantity);
		} else {
			divContent += '<div id="market' + market.market_id + '">';
			divContent += '<p>' + market.market_name + '</p>';
			divContent += '<h4>' + market.quantity + '</h4>';

			divContent += '<button type="button" class="buyBtn" name="' + market.market_id + '">Buy</button>';
			divContent += '<button type="button" class="sellBtn" name="' + market.market_id + '">Sell</button>';
		}
	}
	$('#marketsWrapper').html(divContent);
	$('.buyBtn').on('click', function (event) {
		//console.log(this.name);
		socket.emit('buy', parseInt(this.name));
		// console.log("buy");
	})
	$('.sellBtn').on('click', function (event) {
		//console.log(this.name);
		socket.emit('sell', parseInt(this.name));
	})
}

//  Arduino Serial
function serialBuyControl() {
	socket.emit('buy', parseInt("2"));
	console.log("receive");
}

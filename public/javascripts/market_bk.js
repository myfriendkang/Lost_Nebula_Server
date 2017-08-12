var socket;
var market;
var time = 30;
var width = 1500, height = 200;
$(document).ready(function() {

	socket = io.connect('http://localhost:8080');
	 socket.on('markets', function (data) {
	 	if (!market) {
	 		market = data[parseInt(window.location.href.slice(-1))];
	 		console.log(market);
	 		$('h1').html(market.market_name);
	 		$('#marketname').html(market.market_name);
	 		drawGraph(market.market_id);
	 	}
	    updateValues(data)
	   	
	 });
});

function updateValues(data) {
	var newData = data[market.market_id];
	market = newData;
	$('#quantityNum').html(market.quantity);
	$('#valueNum').html(market.value);
	
}
function drawGraph(market_id) {
	var limit = 60 * 1,
            duration = 750,
            now = new Date(Date.now() - duration)

	var svg = d3.select('.graph').append('svg')
        .attr('class', 'chart')
        .attr('width', width + 50)
        .attr('height', height + 50);
   svg.append("defs").append("clipPath")
	    .attr("id", "clip")
	  .append("rect")
	    .attr("width", width)
	    .attr("height", height);
    d3.csv("data/data" + market_id + ".csv", function(err, data) {
    
    	
      data.forEach(function(d) {
      		d.time = parseInt(d.time);
	        d.value = parseInt(d.value);
      	
      });
     // console.log(data);
     var x = d3.scale.linear().domain([0,300]).range([0, width]);
     var y = d3.scale.linear().domain([0, d3.max(data, function(d) { return d.value; })]).range([height, 0]);
     var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
     var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
     var valueline = d3.svg.line()
     	.interpolate('basis')
		.x(function(d) { return x(d.time); })
		.y(function(d) { return y(d.value); });

     var path = svg.append("path")	
		.attr("class", "line")
		.attr("clip-path", "url(#clip)")
		.attr("d", valueline(data))
		.attr("transform", "translate(50,0)");
	/*
     svg.append("g")		
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
 */
	svg.append("g")		
		.attr("class", "y axis")
		.attr("transform", "translate(50,0)")
		.call(yAxis);
	
	
    });



}
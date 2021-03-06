var socket;
var market;
var marketData = [];
var graphedData = [];
var width = 1250,
    height = 270;
var startTime = 10;
var interval = 500;
var currentIndex = 0;
var currentTime, nextTime;
var x, y, valueline;
$(document).ready(function() {
    socket = io.connect('http://localhost:8080');
    socket.on('resetMarkets', function(data) {
        market = data[parseInt(window.location.href.slice(-1))];
        currentTime = startTime;
        currentIndex = 0;
        console.log(market);
        $('h1').html(market.market_name);
        $('#marketname').html(market.market_name);
        graphedData = [];
        drawGraph(market.market_id);
        updateQuantity();
    })
    socket.on('updateQuantity', function(data) {
        market.quantity = data[market.market_id].quantity;
        updateQuantity();
    });
});

function drawGraph(market_id) {
    $('.graph').html('');
    var svg = d3.select('.graph').append('svg').attr('class', 'chart').attr('width', width + 50).attr('height', height + 50);
    svg.append("defs").append("clipPath").attr("id", "clip").append("rect").attr("width", width).attr("height", height);
    d3.csv("http://localhost:8080/data/data" + market_id + ".csv", function(err, data) {
        data.forEach(function(d, i) {
            d.time = parseInt(d.time);
            d.value = parseInt(d.value);
            if (d.time <= startTime) {
                currentIndex = i;
                graphedData.push(d);
            }
        });
        marketData = data;
        // console.log(data);
        x = d3.scale.linear().domain([0, 300]).range([0, width]);
        y = d3.scale.linear().domain([0, d3.max(data, function(d) {
            return d.value;
        })]).range([height, 0]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5);
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);
        valueline = d3.svg.line().interpolate('step-before').x(function(d) {
            return x(d.time);
        }).y(function(d) {
            return y(d.value);
        });
        var path = svg.append("path").attr("class", "line").attr("id", "svgGraph").attr("clip-path", "url(#clip)")
            //.attr("d", valueline(graphedData))
            .attr("transform", "translate(50,0)");
        /*
     svg.append("g")		
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
 */
        svg.append("g").attr("class", "y axis").attr("transform", "translate(48,0)").call(yAxis);
        svg.append('g').attr('class', 'explosions').attr("transform", "translate(50,0)");
        tick(svg, valueline);
    });
}

function updateGraph(/*svg, valueline, */market_id) {
    try {
        var colorCode = "#00FFFF";
        switch (market_id) {
            case 1:
                colorCode = "#FF4AFF";
                break;

            case 2:
                colorCode = "#00FFFF";
                break;

            case 3:
                colorCode = "#FFD400";
                break;

            case 4:
                colorCode = "#00FF00";
                break;
        }
        d3.select(".line").attr("d", valueline(graphedData));
        graphedData.forEach(function(data, index) {
            if (data.value == 0 && document.body.style.color != "#FF1A1A") {
                drawExplosion(data, market_id);
            } else {
            	if (document.body.style.color != colorCode) {
            		normalExplosion(data, market_id);	
            	}
            }
        });
    } catch (e) {
        console.log(e);
    }
}

function updateValue() {
    $('#valueNum').html(marketData[currentIndex].value);
}

function updateQuantity() {
    $('#quantityNum').html(market.quantity);
}

function normalExplosion(data, market_id) {
    var colorCode = "#00FFFF";
    switch (market_id) {
        case 1:
            colorCode = "#FF4AFF";
            break;

        case 2:
            colorCode = "#00FFFF";
            break;

        case 3:
            colorCode = "#FFD400";
            break;

        case 4:
            colorCode = "#00FF00";
            break;
    }
    document.body.style.backgroundImage = "url(/images/market"+ market_id +"bg.png)"
    document.body.style.color = colorCode;

    var svgGraph = document.getElementById('svgGraph');
    svgGraph.style.stroke = colorCode;

    var svgAxis = document.getElementsByTagName('text');
    for (var i = 0, max = svgAxis.length; i < max; i++) {
        svgAxis[i].style.fill = colorCode;
    }
}

function drawExplosion(data, market_id) {
    d3.select(".explosions").append("circle").attr("cx", function(d) {
        return x(data.time) - 4
    }).attr("cy", function(d) {
        return y(data.value)
    }).attr("r", 6).style("stroke", "#FF1A1A").style("stroke-width", 2);
    
    document.body.style.backgroundImage = "url(/images/market2bg_explosion.png)";
    document.body.style.color = "#FF1A1A";
    
    var svgGraph = document.getElementById('svgGraph');
    svgGraph.style.stroke = "#FF1A1A";

    var svgAxis = document.getElementsByTagName('text');
    for (var i = 0, max = svgAxis.length; i < max; i++) {
        svgAxis[i].style.fill = "#FF1A1A";
    }
}
/*$( 'body' ).drawExplosion(function() {
  $( this ).toggleClass( "market_explosion" );
});*/
function tick(svg, valueline) {
    if (marketData.length - 2 > currentIndex) {
        if (!currentTime) {
            currentTime = startTime;
        } else {
            currentTime = nextTime;
        }
        nextTime = marketData[currentIndex + 1].time;
        if (currentTime !== nextTime) {
            graphedData.push(marketData[currentIndex]);
            updateGraph(/*svg, valueline, */market.market_id);
            updateValue();
            if (marketData[currentIndex].value == 0) {
                drawExplosion(marketData[currentIndex]);
            }
            socket.emit('updateValue', {
                'market_id': market.market_id,
                'value': marketData[currentIndex].value
            });
            currentIndex++;
            setTimeout(tick, (nextTime - currentTime) * interval);
        }
    }
}
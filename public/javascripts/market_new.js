var socket;
var market;
var cylinderData = [0,00, 0, 0, 0, 0, 0, 0, 0, 0];
var cylinderActive = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
var cylinderInactive = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
var height = 286;
var width = 1000;
var yScale = d3.scale.linear().domain([0, 200]).range([0, height]);
var barWidth = 42;
var barOffset = 59;
var percentage = 10;
var startValue = 100;
var intervalTime = 3000;
var intervalTimerArr = [];
var cylinderIndexes = [];
$(document).ready(function() {
    socket = io.connect('http://localhost:8080');
    socket.on('resetMarkets', function(data) {
        market = data[parseInt(window.location.href.slice(-1))];
        if (typeof market == "undefined") {
            market = {
                market_id: 1,
                market_name: "Fuel Cell"
            };
        }
        $('h1').html(market.market_name);
        $('#marketname').html(market.market_name);
        $('#quantityNum').addClass('pulsate').html(0);
        clearIntervals();
        startValue = 100;
        cylinderIndexes = [];
        cylinderData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        cylinderActive = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        cylinderInactive = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
        initGraph();
    })
    socket.on('updateQuantity', function(data) {
        market.quantity = data[market.market_id].quantity;
        updateQuantity(data, market);
    });
});

function updateQuantity(data, market) {
    $('#quantityNum').addClass('pulsate').html(data[market.market_id].quantity);
    setTimeout(function() {
        $('#valueNum').removeClass('pulsate');
    }, 600);

    console.log(data[market.market_id]);
    if (data[market.market_id].clicked == 'buy') {
        var currentIndex = parseInt(data[market.market_id].cylinder);
        cylinderIndexes.push(currentIndex);
        cylinderActive[currentIndex] = startValue;
        cylinderData[currentIndex] = startValue;
        initGraph();
        $("#cylinder" + currentIndex + "_value p").html(startValue);
        intervalTimerArr[currentIndex] = setInterval(function(currentIndexParam) {
            var currentValue = cylinderInactive[currentIndexParam];
            var percentageValue = (currentValue * percentage) / 100;
            currentValue = Math.floor(currentValue + percentageValue);
            if (currentValue < 200) {
                cylinderInactive[currentIndexParam] = currentValue;
                cylinderData[currentIndexParam] = currentValue;
                initGraph();
                $("#cylinder" + currentIndexParam + "_value p").html(currentValue);
            } else {
                clearIntervals(intervalTimerArr[currentIndexParam]);
            }
        }, intervalTime, currentIndex);
    } else {
        var removableCylinder = cylinderIndexes[0];
        var revokeValue = cylinderData[removableCylinder];
        console.log("revokeValue : " + revokeValue);
        data[0].quantity = parseInt(data[0].quantity + revokeValue); 
        socket.emit('updateValue', data);
        cylinderIndexes.shift();
        $("#cylinder" + removableCylinder + "_value p").html(0);
        clearIntervals(intervalTimerArr[removableCylinder]);
        cylinderActive[removableCylinder] = 0;
        cylinderInactive[removableCylinder] = 100;
        cylinderData[removableCylinder] = 0;        
        initGraph();
    }
}

function clearIntervals(intervalId) {
    if (typeof intervalId != "undefined" && intervalId != "") {
        clearInterval(intervalId);
        $("#cylinder" + intervalId + "_value p").html(0);
    } else {
        for (i in intervalTimerArr) {
            clearInterval(intervalTimerArr[i]);
            $("#cylinder" + i + "_value p").html(0);
        }
    }
}

var bar_data,bar_active_data,bar_inactive_data;
function initGraph() {
    
    if(!bar_data){
    	bar_data = d3.select('.barchart_data').append('svg').attr('width', width).attr('height', height);
    }
    var barData = bar_data.selectAll('rect').data(cylinderData);
    
    barData.enter().append('rect').style('fill', '#980BFC').style("opacity", 0.5).attr("rx", 21).attr("ry", 21);
    
    barData
    .transition()
    .duration(2000)
    .delay(function(d,i) { return i * 50;})
    .attr('width', barWidth).attr('height', function(d) {
        return yScale(d)
    }).attr('x', function(d, i) {
        return i * (barWidth + barOffset);
    }).attr('y', function(d) {
        return height - yScale(d);
    });
    
    
    if(!bar_active_data){
    	bar_active_data =d3.select('.barchart_active').append('svg').attr('width', width).attr('height', height);
    }
    var barActiveData = bar_active_data.selectAll('rect').data(cylinderActive);
    
    barActiveData.enter().append('rect').style('fill', '#980BFC').style("opacity", 1).attr("rx", 21).attr("ry", 21);
    
    barActiveData
    .transition()
    .duration(2000)
    .delay(function(d,i) { return i * 50;})
    .attr('width', barWidth).attr('height', function(d) {
        return yScale(d);
    }).attr('x', function(d, i) {
        return i * (barWidth + barOffset);
    }).attr('y', function(d) {
        return height - yScale(d);
    });
    
    
    if(!bar_inactive_data){
    	bar_inactive_data =d3.select('.barchart_inactive').append('svg').attr('width', width).attr('height', height);
    }
   
    var barInActiveData = bar_inactive_data.selectAll('rect').data(cylinderInactive);
    
    
    barInActiveData.enter().append('rect').style('fill', '#980BFC').style("opacity", 0.25).attr("rx", 21).attr("ry", 21);
    barInActiveData
    .transition()
    .duration(2000)
    .delay(function(d,i) { return i * 50;})
    .attr('width', barWidth).attr('height', function(d) {
        return yScale(d);
    }).attr('x', function(d, i) {
        return i * (barWidth + barOffset);
    }).attr('y', function(d) {
        return height - yScale(d);
    });
}
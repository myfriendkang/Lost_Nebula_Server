var socket;
var market;

var height = 286, width = 959;
var marginTop = 20;
var animationDuration = 2000;
var lifespan = 1; //in minutes
 var x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.57),
    y = d3.scaleLinear().rangeRound([height,0]);
var activeBars, valueBars, svg;
var intervalTime = 2000;
//  #cylinder6_value(style='width:66px;position: absolute;top: 326px;left: 808px;text-align:center;')
 //   p.cylinders_value_text 0

var cylinders = new Array(10);
$(document).ready(function() {
    //socket = io.connect('http://localhost:8080');
    socket = io.connect('http://192.168.1.139:8080');// Keyu ip address
    //socket = io.connect('http://192.168.1.11:8080');// Felix ip address
    socket.on('resetMarkets', function(data) {
        market = data[parseInt(window.location.href.slice(-1))];
        
        $('h1').html(market.market_name);
        $('#marketname').html(market.market_name);
        $('#quantityNum').addClass('pulsate').html(0);

        for (var i=0; i<cylinders.length; i++) {
           
            cylinders[i] = {'active': false,
                            'index': i,
                            'startTime': 0,
                            'initValue': market.initValue,
                            'value': market.initValue};
            $(".barchart_nums").append('<p class="barChartValueText barChartValueText' + i +'" style="left:' + (i*101) + 'px">0</p>')
        }
        drawGraph();
       
    })
    socket.on('updateQuantity', function(data) {
        if (market.quantity !== data[market.market_id].quantity) {
           var buyOrSell = (market.quantity < data[market.market_id].quantity);
           market.quantity = data[market.market_id].quantity;
           updateQuantity(buyOrSell);
        }
       
        
    });

});
function drawGraph() {
   if (!svg) svg = d3.select('.barchart_data').append('svg').attr('width', width).attr('height', height);


   

    x.domain(cylinders.map(function(d) { return d.index; }));
    y.domain([0, market.maxValue]);

    g = svg.append("g");

    g.selectAll(".inactive")
    .data(cylinders)
    .enter().append("rect")
      .attr("class", "inactive")
      .attr("x", function(d) { return x(d.index); })
      .attr("y", function(d) { return y(d.initValue); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return y( d.initValue); })
      .style('fill', market.color)
      .style("opacity", 0.25)
      .attr("rx", 21)
      .attr("ry", 21);
      
    activeBars = svg.append("g");
    valueBars = svg.append("g");

   
   updateBars(activeBars, animationDuration, "initValue", 0.5);



   window.setInterval(updateNums, intervalTime);
}
function updateNums() {
    var currentValue = market.initValue;
    for (var i=0; i<cylinders.length; i++) {
        if (cylinders[i].active) {
          
             cylinders[i].value = Math.min(market.maxValue, (Date.now() - cylinders[i].startTime) * (market.maxValue - market.initValue) / (lifespan * 60000) + market.initValue);
             
           if (currentValue == market.initValue) currentValue = Math.round(cylinders[i].value);
            $(".barChartValueText" + i).html(Math.round(cylinders[i].value));
             console.log(cylinders[i].value);

        }
       
    }
    updateBars(valueBars, animationDuration, "value", 0.5);
    socket.emit('updateValue', {
                'market_id': market.market_id,
                'value': currentValue
        });
}
function updateQuantity(buyOrSell) {
     $('#quantityNum').html(market.quantity);
     if (buyOrSell) {
        for (var i=0; i<cylinders.length; i++) {

            if (!cylinders[i].active) {
                cylinders[i].active = true;
                cylinders[i].startTime = Date.now();
                $(".barChartValueText" + i).html(market.initValue);
                break;
            }
         }
     } else {
         for (var i=0; i<cylinders.length; i++) {

            if (cylinders[i].active) {
                cylinders[i].active = false;
                cylinders[i].startTime = 0;
                cylinders[i].value = market.initValue;
                $(".barChartValueText" + i).html("0");
                break;
            }
         }
     }
     
     updateBars(activeBars, animationDuration, "initValue",1);
     updateBars(valueBars, animationDuration, "value",0.5);
}

function updateBars(target, duration, property, opacity) {

  var active = target.selectAll("rect").data(cylinders);

  active.attr("class", "update");

  active.enter().append("rect")

          .attr("x", function(d) { return x(d.index); })
          .attr("width", x.bandwidth())
          .style('fill', market.color)
          .style("opacity", opacity)
          .attr("rx", 21)
          .attr("ry", 21)
    .merge(active)
        .transition().duration(duration)
        .attr("y", function(d) { return  y((d.active? d[property] : 0)); })
        .attr("height", function(d) { return y((d.active ? (market.maxValue - d[property]) : market.maxValue)); });

  active.exit().remove();
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
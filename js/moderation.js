var xScale;
var yScale;
var plot;
var line;

var xAxis;
var yAxis;

//var figwidth = 500;
//var figheight = 500;

var margin = {bottom: 80, left: 40, top: 40, right: 40}; // bottom, left, top, right
var figwidth;
var figheight;
var plotwidth;
var plotheight;

var xInPlot = "x1"

var x1range = [0.0,10.0];
var x2range = [0.0,10.0];
var xrange = x1range;
var xOtherRange = [x2range[0],x2range[0] + .5*(x2range[1] - x2range[0]),x2range[1]];
var yrange = [0.0,10.0];
var b0 = 1.0;
var b1 = 0.6;
var b2 = 0.3;
var b3 = 0.1;

var lineColors = ["#006699","#3399CC","#66CCFF"];

var linesData = [
        [{x: 5, y: 20}, {x: 330, y: 95}],
        [{x: 410, y: 12}, {x: 220, y: 88}],
        [{x: 410, y: 12}, {x: 220, y: 88}]
    ];

function b0change(value) {
    b0 = value;
    $('#b0-value').text(value);
    updateLinesData();
    updateLines();
}

function b1change(value) {
    b1 = value;
    $('#b1-value').text(value);
    updateLinesData();
    updateLines();
}

function b2change(value) {
    b2 = value;
    $('#b2-value').text(value);
    updateLinesData();
    updateLines();
}

function b3change(value) {
    b3 = value;
    $('#b3-value').text(value);
    updateLinesData();
    updateLines();
}

function x1scalechange(values) {
    x1range = values;
    $('#x1range-min').text(values[0])
    $('#x1range-max').text(values[1])
    if(xInPlot == "x1") {
        xrange = x1range;
        xScale.domain([xrange[0], xrange[1]])
        drawXaxis();
        // update clipping
        d3.select('#clip')
            .x = xScale(xrange[0])
            .width = xScale(xrange[1]) - xScale(xrange[0]);
    } else {
        xOtherRange = [x1range[0],x1range[0] + .5*(x1range[1] - x1range[0]),x1range[1]];
    }
    updateLinesData();
    updateLines();
}

function x2scalechange(values) {
    x2range = values;
    $('#x2range-min').text(values[0])
    $('#x2range-max').text(values[1])
    if(xInPlot == "x2") {
        xrange = x2range;
        xScale.domain([xrange[0], xrange[1]])
        drawXaxis();
        // update clipping
        d3.select('#clip')
            .x = xScale(xrange[0])
            .width = xScale(xrange[1]) - xScale(xrange[0]);
    } else {
        xOtherRange = [x2range[0],x2range[0] + .5*(x2range[1] - x2range[0]),x2range[1]];
    }
    updateLinesData();
    updateLines();
}

function yscalechange(values) {
    yrange = values;
    $('#yrange-min').text(values[0])
    $('#yrange-max').text(values[1])
    yScale.domain([yrange[0], yrange[1]])
    drawYaxis();
    // update clipping region
    d3.select("#clip")
        .y = yScale(yrange[1])
        .height = yScale(yrange[0]) - yScale(yrange[1]);
    updateLinesData();
    updateLines();
}

function drawXaxis() {
    xScale.domain([xrange[0], xrange[1]]);
    xAxis.scale(xScale);
    plot.select(".xaxis").transition().duration(1).call(xAxis);
}

function drawYaxis() {
    yScale.domain([yrange[0], yrange[1]]);
    yAxis.scale(yScale);
    plot.select(".yaxis").transition().duration(1).call(yAxis);
}

function updateLinesData() {
    // update lines data
    linesData[0][0].x = xrange[0];
    linesData[1][0].x = xrange[0];
    linesData[2][0].x = xrange[0];
    linesData[0][1].x = xrange[1];
    linesData[1][1].x = xrange[1];
    linesData[2][1].x = xrange[1];
    if(xInPlot == "x1") {
        linesData[0][0].y = b0 + b2*xOtherRange[0] + (b1 + b3*xOtherRange[0])*xrange[0];
        linesData[0][1].y = b0 + b2*xOtherRange[0] + (b1 + b3*xOtherRange[0])*xrange[1];
        linesData[1][0].y = b0 + b2*xOtherRange[1] + (b1 + b3*xOtherRange[1])*xrange[0];
        linesData[1][1].y = b0 + b2*xOtherRange[1] + (b1 + b3*xOtherRange[1])*xrange[1];
        linesData[2][0].y = b0 + b2*xOtherRange[2] + (b1 + b3*xOtherRange[2])*xrange[0];
        linesData[2][1].y = b0 + b2*xOtherRange[2] + (b1 + b3*xOtherRange[2])*xrange[1];
    } else {
        linesData[0][0].y = b0 + b1*xOtherRange[0] + (b2 + b3*xOtherRange[0])*xrange[0];
        linesData[0][1].y = b0 + b1*xOtherRange[0] + (b2 + b3*xOtherRange[0])*xrange[1];
        linesData[1][0].y = b0 + b1*xOtherRange[1] + (b2 + b3*xOtherRange[1])*xrange[0];
        linesData[1][1].y = b0 + b1*xOtherRange[1] + (b2 + b3*xOtherRange[1])*xrange[1];
        linesData[2][0].y = b0 + b1*xOtherRange[2] + (b2 + b3*xOtherRange[2])*xrange[0];
        linesData[2][1].y = b0 + b1*xOtherRange[2] + (b2 + b3*xOtherRange[2])*xrange[1]; 
    }
    
}

function updateLines() {

    plot.selectAll(".line")
        .data(linesData) // set the new data
        .attr("d", line); 

}

function redrawPlot() {
        
    
}


$(document).ready(function() {
    figheight = $('#plot').height();
    figwidth = $('#plot').width();
    plotwidth = figwidth - margin.left - margin.right;
    plotheight = figheight - margin.bottom - margin.top;
    
    $('#xaxis-radio').buttonset();
    $('label[for=xaxis-x1]').click(function(){
        if(xInPlot != "x1") {
           xInPlot = "x1";
           xrange = x1range;
           xOtherRange = [x2range[0],x2range[0] + .5*(x2range[1] - x2range[0]),x2range[1]];
           updateLinesData();
           drawXaxis();
           updateLines();
           
        };
    });
    $('label[for=xaxis-x2]').click(function(){
        if(xInPlot != "x2") {
           xInPlot = "x2";
           xrange = x2range;
           xOtherRange = [x1range[0],x1range[0] + .5*(x1range[1] - x1range[0]),x1range[1]];
           updateLinesData();
           drawXaxis();
           updateLines();
        };
    });
    $('#b0').slider({
        min: -10.0,
        max: 10.0,
        step: 0.01,
        value: 1.0,
        slide: function(event, ui) {
            b0change(ui.value);
        }
    });
    $('#b1').slider({
        min: -2.0,
        max: 2.0,
        step: 0.01,
        value: 0.6,
        slide: function(event, ui) {
            b1change(ui.value);
        }
    });
    $('#b2').slider({
        min: -2.0,
        max: 2.0,
        step: 0.01,
        value: 0.3,
        slide: function(event, ui) {
            b2change(ui.value);
        }
    });
    $('#b3').slider({
        min: -2.0,
        max: 2.0,
        step: 0.01,
        value: 0.1,
        slide: function(event, ui) {
            b3change(ui.value);
        }
    });
    $('#yrange').slider({
        range: true,
        min: -10.0,
        max: 30.0,
        step: 1.0,
        values: [ 0.0, 10.0 ],
        slide: function(event, ui) {
            yscalechange(ui.values);
        }
    });
    $('#x1range').slider({
        range: true,
        min: -10.0,
        max: 30.0,
        step: 1.0,
        values: [ 0.0, 10.0 ],
        slide: function(event, ui) {
            x1scalechange(ui.values);
        }
    });
    $('#x2range').slider({
        range: true,
        min: -10.0,
        max: 30.0,
        step: 1.0,
        values: [ 0.0, 10.0 ],
        slide: function(event, ui) {
            x2scalechange(ui.values);
        }
    });
    
    // initialize the plot
    plot = d3.select("#plot")
        .append("svg")
        .attr("width", figwidth)   
        .attr("height", figheight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scale.linear()
                         .domain([xrange[0], xrange[1]])
                         .range([0, plotwidth]);
                         
    yScale = d3.scale.linear()
                         .domain([yrange[0], yrange[1]])
                         .range([plotheight, 0]);
    
    
    plot.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", xScale(xrange[0]))
        .attr("y", yScale(yrange[1]))
        .attr("width", xScale(xrange[1]) - xScale(xrange[0]))
        .attr("height", yScale(yrange[0]) - yScale(yrange[1]));

    //Define X axis
    xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(5);

    //Define Y axis
    yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(5);
                      
    //Create X axis
    plot.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + 0 + "," + plotheight + ")")
        .call(xAxis)
        .append("text")
        .text("X");
    
    //Create Y axis
    plot.append("g")
        .attr("class", "yaxis")
        //.attr("transform", "translate(" + plotwidth + ",0)")
        .call(yAxis)
        .append("text")
        .text("Y");
    
    line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return xScale(d.x); })
        .y(function(d) { return yScale(d.y); });
        
    updateLinesData();
     plot.selectAll(".line")
       .data(linesData)
       .enter()
       .append("path")
       .attr("clip-path", "url(#clip)")
       .attr("class", "line")
       .attr("d", line)
       .style("stroke", function(d,i) { return lineColors[i]; });
       //.attr("transform", "translate(" + 0 + "," + margins[2] + ")");
       //.style("stroke", "rgb(6,120,155)");
       
    
    
    /*
    var myLine = plot.append("line")
        .attr("x1", 40)
        .attr("y1", 50)
        .attr("x2", 450)
        .attr("y2", 150)
        .style("stroke", "rgb(6,120,155)");
        */ 


});

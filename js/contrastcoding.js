// plot variables
var plot,
    figWidth,
    figHeight,
    plotWidth,
    contrastPlotHeight,
    contrastPlotWidth,
    plotRatio = [.4,.1,.4],
    contrast,
    margin = {bottom: 80, left: 40, top: 40, right: 40}, // bottom, left, top, right
    yrange = [-10.0,20.0],
    xrange = [0.5,3.5],
    yScale,
    xScale,
    meanRects,
    animRects,
    animTimes = [500,200,1000,200,1000,200,1000,1000]; // contrast fade in, pause, contrast scale, pause, contrast move, pause, contrast add, pause

// main variables
var nGroups = 3,
    groupNames = ["A","B","C","D","E"],
    contrastType = "helmert",
    groupMeans = [4.0,-8.0,2.0],
    currentPos = [0,0,0],
    nextPos = [-2/3,-2/3,-2/3],
    beta = [0,0,0],
    helmert = [[[-1,1]],[[-2,1,1],[0,-1,1]],[[-3,1,1,1],[0,-2,1,1],[0,0,-1,1]],[[-4,1,1,1,1],[0,-3,1,1,1],[0,0,-2,1,1],[0,0,0,-1,1]]],
    dummy = [[[0,1]],[[0,1,0],[0,0,1]],[[0,1,0,0],[0,0,1,0],[0,0,0,1]],[[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]]],
    polynomial = [[[-1,1]],[[-1,0,1],[1,-2,1]],[[-3,-1,1,3],[1,-1,-1,1],[-1,3,-3,1]],[[-2,-1,0,1,2],[2,-1,-2,-1,2],[-1,2,0,-2,1],[1,-4,6,-4,1]]],
    contrasts = helmert[1];

function setContrasts() {
    if(contrastType == "helmert") contrasts = helmert[nGroups-2];
    if(contrastType == "polynomial") contrasts = polynomial[nGroups - 2];
    if(contrastType == "dummy") contrasts = dummy[nGroups - 2];
}

function setMeans(value) {
    groupMeans = value;
    calcBeta();
    updateMeans();
};

function drawMeans() {
    groupMeans = [];
    for(i = 0; i < nGroups; i ++) {
        groupMeans[i] = yrange[0] + (yrange[1] - yrange[0])*Math.random();
    }
}

function calcBeta() {
    beta = [];
    
    var num = 0.0;
    var denom = 0.0;
    if(contrastType != "dummy") {
        for( j = 0; j < nGroups; j++ ) {
            num += groupMeans[j];
        }
        beta[0] = num/nGroups;
        for( i = 0; i < nGroups - 1; i++ ) {
            num = 0.0;
            denom = 0.0;
            for( j = 0; j < nGroups; j++ ) {
                num += contrasts[i][j] * groupMeans[j];
                denom += contrasts[i][j] * contrasts[i][j];
            }
            beta[i + 1] = num/denom;
        }
    } else {
        beta[0] = groupMeans[0];
        for( i = 0; i < nGroups - 1; i++ ) {
          beta[i+1] =  groupMeans[i+1] - groupMeans[0];  
        }
    }
};

function updateMeans() {
    // update the points for the means...
    
    // check whether we need to add/remove rects
    
    if(meanRects[0].length != nGroups) {
        plot.selectAll("rect").remove();
        xrange[1] = nGroups + .5;
        xScale = d3.scale.linear()
                         .domain([xrange[0], xrange[1]])
                         .range([0, plotWidth]);
         
        xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(nGroups);

        plot.selectAll(".xaxis").remove();
        plot.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(" + 0 + "," + contrastPlotHeight + ")")
            .call(xAxis)
            .append("text")
            .text("X");
        
        plot.append("g")
            .attr("class", "xaxis")
            .attr("transform", "translate(" + 0 + "," + (contrastPlotHeight + paddingHeight + plotHeight) + ")")
            .call(xAxis)
            .append("text")
            .text("X");
        
        meanRects = plot.selectAll("meanRect")
           .data(groupMeans)
           .enter()
           .append("rect")
           .attr("x", function(d, i) {
                return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
           })
           .attr("y", function(d) {
                return yScale(Math.max(0, d));
           })
           .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
           .attr("height", function(d) {
                return Math.abs(yScale(d) - yScale(0)); // * 4;
           });
       
       currentPos = []
       for(i = 0; i < nGroups; i++) currentPos[i] = 0;
       
       contrastRects = plot.selectAll("contrastRect")
           .data(currentPos)
           .enter()
           .append("rect")
           .attr("x", function(d, i) {
                return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
           })
           .attr("y", function(d) {
                return yScale(Math.max(0, d));
           })
           .attr("fill", "red")
           .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
           .attr("height", function(d) {
                return Math.abs(yScale(d) - yScale(0)); // * 4;
           });
        
    } else {
        // transition the rectangles
        meanRects.data(groupMeans)
           .transition(duration=100)
           .attr("y", function(d) {
                    return yScale(Math.max(0, d));
            })
            .attr("height", function(d) {
                return Math.abs(yScale(d) - yScale(0)); // * 4;
           });
    }
}

function animate2() {
    var tmpPos = [], 
        tmpPos2 = [],
        timeIn = 0;
        
    // make sure contrasts and animRects are reset
    plot.selectAll("contrastRect").remove();
    plot.selectAll("animRect2").remove();
    animRects2 = null;
    contrastRects = null;
    currentPos = []
    for(i = 0; i < nGroups; i++) currentPos[i] = 0;
    animRects2 = plot.selectAll("animRect2")
       .data(currentPos)
       .enter()
       .append("rect")
       .attr("class", "animRect2")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yScale(d);
       })
       .attr("fill", "black")
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", 0)
       .attr("opacity",0);
    
    contrastRects = plot.selectAll("contrastRect")
       .data(currentPos)
       .enter()
       .append("rect")
       .attr("class", "contrastRect")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yContrastScale(d);
       })
       .attr("fill", "red")
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", 0)
       .attr("opacity",0);

    // set meanRects to transparent
    meanRects.style("opacity",.5);
    
    // intercept
    for(j = 0; j < nGroups; j++) {
       currentPos[j] = 0;
       nextPos[j] = beta[0];
    }
    
    // fade in
    contrastRects.data(nextPos)
        .transition().duration(animTimes[0])
        .attr("y", function(d) {
             return(yContrastScale(Math.max(d,0)));
         })
        .attr("height",function(d) {
            return(Math.abs(yContrastScale(d) - yContrastScale(0)));
         })
       .style("opacity",1);
       
    timeIn += animTimes[0] + animTimes[1];
    
    // move to plot
    contrastRects.transition().duration(animTimes[2]).delay(timeIn)
       .attr("y", function(d) {
            return yScale(Math.max(0, d));
        })
        .attr("height",function(d,k) {
            return Math.abs(yScale(d) - yScale(0)); // * 4;
       })
       .style("opacity",1);
       
    timeIn += animTimes[2] + animTimes[3];
    
    // add to/subtract from plot bars

     contrastRects.transition().duration(.5*animTimes[4]).delay(timeIn)
        .style("opacity",0);

     animRects2.data(nextPos)
      .transition().duration(animTimes[4]).delay(timeIn)
       .attr("y", function(d, k) {
            return yScale(Math.max(0, d));
       })
       .attr("height", function(d,k) {
            return Math.abs(yScale(d) - yScale(0)); // * 4;
       })
       .attr("opacity",1); 
       
    timeIn += animTimes[4] + animTimes[5];
    for(j=0; j < nGroups; j++) currentPos[j] = nextPos[j];
    // reset animRects
    contrastRects.transition().duration(20).delay(timeIn)
        .attr("y", yContrastScale(0))
        .attr("height",0);
    timeIn += 20;
    
    
    for( i=0; i < nGroups - 1; i++) {
        // get contrast value
        for(j = 0; j < nGroups; j++) {
            tmpPos[j] = contrasts[i][j];
        }

        // fade in contrasts
        contrastRects.data(tmpPos)
            .transition().duration(animTimes[0]).delay(timeIn)
            .attr("y", function(d) {
                return yContrastScale(Math.max(0, d));
            })
            .attr("height",function(d,k) {
                return Math.abs(yContrastScale(d) - yContrastScale(0)); // * 4;
           })
           .style("opacity",1);
           
        timeIn += animTimes[0] + animTimes[1];
           
        // grow to beta times contrast value
        for(j = 0; j < nGroups; j++) {
            tmpPos2[j] = beta[i+1]*contrasts[i][j];
        }
        contrastRects.data(tmpPos2)
            .transition().duration(animTimes[2]).delay(timeIn)
            .attr("y", function(d) {
                return yContrastScale(Math.max(0, d));
            })
            .attr("height",function(d,k) {
                return Math.abs(yContrastScale(d) - yContrastScale(0)); // * 4;
           });
           
        timeIn += animTimes[2] + animTimes[3];
        
        // move to plot
        // 
        for(j = 0; j < nGroups; j++) {
            nextPos[j] = currentPos[j] + tmpPos2[j];
        }
        // if(currentPos >= 0 & tmpPos2 < 0) -> subtract value/shrink; y = currentPos, height = abs(tmpPos2)
        // if(currentPos < 0 & tmpPos2 > 0) -> subtract value/shrink; y = nextPos, height = abs(tmpPos2)
        // if(currentPos >= 0 & tmpPos2 > 0) -> add value/grow; y = nextPos
        // if(currentPos < 0 & tmpPos2 < 0) -> add value/grow; y = currentPos
        contrastRects.data(nextPos)
            .transition().duration(animTimes[4]).delay(timeIn)
            .attr("y", function(d, k) {
                if(currentPos[k] >= 0 && tmpPos2[k] < 0) return yScale(currentPos[k]);
                if(currentPos[k] < 0 && tmpPos2[k] >= 0) return yScale(nextPos[k]);
                if(currentPos[k] >= 0 && tmpPos2[k] >= 0) return yScale(nextPos[k]);
                if(currentPos[k] < 0 && tmpPos2[k] < 0) return yScale(currentPos[k]);
            })
            .attr("height",function(d,k) {
                return Math.abs(yScale(tmpPos2[k]) - yScale(0)); // * 4;
           });
        timeIn += animTimes[4] + animTimes[5];
        
        // blend
        contrastRects.transition().duration(.5*animTimes[6]).delay(timeIn)
            .style("opacity",0);

        animRects2.data(nextPos)
            .transition().duration(animTimes[6]).delay(timeIn)
            .attr("y", function(d, k) {
                return yScale(Math.max(0, d));
            })
            .attr("height", function(d,k) {
                    return Math.abs(yScale(d) - yScale(0)); // * 4;
            });
        timeIn += animTimes[6] + animTimes[7];
        
        for(j=0; j < nGroups; j++) currentPos[j] = nextPos[j];
        // reset animRects
        contrastRects.transition().duration(20).delay(timeIn)
            .attr("y", yContrastScale(0))
            .attr("height",0);
        timeIn += 20;
    }
    meanRects.transition().duration(1).delay(timeIn)
        .style("opacity",1);
    animRects2.transition().duration(1).delay(timeIn)
        .style("opacity",0);
};
    
    // s
       

function animate() {
    
    for( i=0; i < nGroups; i++) {
        currentPos[i] = 0;
    }
    animRects.data(currentPos)
        .attr("y", function(d, k) {
                return yScale(Math.max(d, 0));
           })
           .attr("height", function(d,k) {
                return Math.abs(yScale(d) - yScale(0)); // * 4;
           });
    
    for( i=0; i < nGroups; i++) {
        
        // loop through beta's
        for( j=0; j < nGroups; j++) {
            if(i == 0) {
                // intercept
                nextPos[j] = beta[i];
            } else {
                nextPos[j] += beta[i]*contrasts[i-1][j];
            }
        }
        console.log("current" + currentPos);
        console.log("next" + nextPos);
        // move y and change height
        // if "going up" need to change y, otherwise height
        animRects.data(nextPos)
          .transition().duration(1000).delay(i*2000)
           .attr("y", function(d, k) {
                return yScale(Math.max(currentPos[k], d));
           })
           .attr("height", function(d,k) {
                //console.log(Math.abs(yScale(d) - yScale(currentPos[k])));
                return Math.abs(yScale(d) - yScale(currentPos[k])); // * 4;
           });
           
        animRects.data(nextPos)
          .transition().duration(1000).delay(i*2000 + 1000)
           .attr("y", function(d) {
                return yScale(d);
           })
           .attr("height", function(d) {
                return 0; // * 4;
           });
         for(j = 0; j < nGroups; j++) {
            currentPos[j] = nextPos[j];
        }
    }
};

setModelText = function() {
    
    var str = "Y = " + beta[0].toFixed(2);
    for(i = 1; i < nGroups; i ++) {
        if(beta[i] > 0) {
            str += " + " + beta[i].toFixed(2) + " &times; X<sub>" + i + "</sub>";
        } else {
            str += " - " + Math.abs(beta[i]).toFixed(2) + " &times; X<sub>" + i + "</sub>";
        }
    }
    $('#model-text').html(str);
}

setContrastValuesText = function() {
    var str = "<table><tr><th></th>";
    
    for(i = 1; i < nGroups; i++) {
        str += "<th>X<sub>" + i + "</sub></th>";
    }
    str += "</tr>";
    
    for(i = 0; i < nGroups; i++) {
        str += "<tr><td>Group " + groupNames[i] + "</td>";
        for(j = 0; j < nGroups - 1; j++) {
            str += "<td class=\"contrastTable\">" + contrasts[j][i] + "</td>";
        }
        str += "</tr>";
    }
    str += "</table>";
    $('#contrastValues-text').html(str);
}

$(document).ready(function() {
    
    figHeight = $('#plot').height();
    figWidth = $('#plot').width();
    plotWidth = figWidth - margin.left - margin.right;
    plotHeight = plotRatio[0]*(figHeight - margin.bottom - margin.top);
    contrastPlotWidth = figWidth - margin.left - margin.right;
    contrastPlotHeight = plotRatio[2]*(figHeight - margin.bottom - margin.top);
    paddingHeight = plotRatio[1]*(figHeight - margin.bottom - margin.top);
    
    $('#contrast-radio').buttonset();
    $('label[for=c-helmert]').click(function(){
        if(contrastType != "helmert") {
           contrastType = "helmert";
           setContrasts();
           calcBeta();
           setModelText();
           setContrastValuesText();
        };
    });
    $('label[for=c-polynomial]').click(function(){
        if(contrastType != "polynomial") {
           contrastType = "polynomial";
           setContrasts();
           calcBeta();
           setModelText();
           setContrastValuesText();
        };
    });
    $('label[for=c-dummy]').click(function(){
        if(contrastType != "dummy") {
           contrastType = "dummy";
           setContrasts();
           calcBeta();
           setModelText();
           setContrastValuesText();
        };
    });
    
    $('#ngroup-radio').buttonset();
    $('label[for=ngroup-2]').click(function(){
        if(nGroups != 2) {
           nGroups = 2;
           setContrasts();
           drawMeans();
           calcBeta();
           updateMeans();
           setModelText();
           setContrastValuesText();
        };
    });
    $('label[for=ngroup-3]').click(function(){
        if(nGroups != 3) {
           nGroups = 3;
           setContrasts();
           drawMeans();
           calcBeta();
           updateMeans();
           setModelText();
           setContrastValuesText();
        };
    });
    $('label[for=ngroup-4]').click(function(){
        if(nGroups != 4) {
           nGroups = 4;
           setContrasts();
           drawMeans();
           calcBeta();
           updateMeans();
           setModelText();
           setContrastValuesText();
        };
    });
    $('label[for=ngroup-5]').click(function(){
        if(nGroups != 5) {
           nGroups = 5;
           setContrasts();
           drawMeans();
           calcBeta();
           updateMeans();
           setModelText();
           setContrastValuesText();
        }; 
    });
    
    $('#sampleMeansButton').button();
    $('#sampleMeansButton').click(function() {
        drawMeans();
        calcBeta();
        updateMeans();
        setModelText();
        setContrastValuesText();
    });
    
    $('#animateButton').button();
    $('#animateButton').click(function() {
        animate2();
    });

    // initialize the plot
    plot = d3.select("#plot")
        .append("svg")
        .attr("width", figWidth)   
        .attr("height", figHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    xScale = d3.scale.linear()
                         .domain([xrange[0], xrange[1]])
                         .range([0, plotWidth]);
                        
    /*
    xScale = d3.scale.ordinal()
                        .domain(d3.range(data.length))
                        .rangeRoundBands([0, .9], .2);
    */                      
    
    yContrastScale = d3.scale.linear()
                         .domain([yrange[0], yrange[1]])
                         .range([contrastPlotHeight, 0]);
                         
    yContrastBarScale = d3.scale.linear()
                         .domain([yrange[0], yrange[1]])
                         .range([0, contrastPlotHeight]);
                         
    yScale = d3.scale.linear()
                         .domain([yrange[0], yrange[1]])
                         .range([contrastPlotHeight+paddingHeight+plotHeight, paddingHeight+contrastPlotHeight]);
                         
    yBarScale = d3.scale.linear()
                         .domain([yrange[0], yrange[1]])
                         .range([paddingHeight+contrastPlotHeight, contrastPlotHeight+paddingHeight+plotHeight]);
                       
    /*
    plot.append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", xScale(xrange[0]))
        .attr("y", yScale(yrange[1]))
        .attr("width", xScale(xrange[1]) - xScale(xrange[0]))
        .attr("height", yScale(yrange[0]) - yScale(yrange[1]));
    */
    
    //Define X axis
    xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(nGroups);

    //Define Y axis
    yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(5);
                      
    yContrastAxis = d3.svg.axis()
                      .scale(yContrastScale)
                      .orient("left")
                      .ticks(5);
                      
    //Create X axis for plot
    plot.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + 0 + "," + (contrastPlotHeight + paddingHeight + plotHeight) + ")")
        .call(xAxis)
        .append("text")
        .text("X");
    
    //Create Y axis for plot
    plot.append("g")
        .attr("class", "yaxis")
        //.attr("transform", "translate(" + plotwidth + ",0)")
        .call(yAxis)
        .append("text")
        .text("Y");
        
    //Create X axis for contrast
    plot.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + 0 + "," + (contrastPlotHeight) + ")")
        .call(xAxis)
        .append("text")
        .text("X");
    
    //Create Y axis for contrast
    plot.append("g")
        .attr("class", "yaxis")
        //.attr("transform", "translate(" + plotwidth + ",0)")
        .call(yContrastAxis)
        .append("text")
        .text("Y");
        
    meanRects = plot.selectAll("meanRect")
       .data(groupMeans)
       .enter()
       .append("rect")
       .attr("class", "meanRect")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yScale(Math.max(0, d));
       })
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", function(d) {
            return Math.abs(yScale(d) - yScale(0)); // * 4;
       });
    
    animRects2 = plot.selectAll("animRect2")
       .data(currentPos)
       .enter()
       .append("rect")
       .attr("class", "animRect2")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yScale(Math.max(0, d));
       })
       .attr("fill", "black")
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", function(d) {
            return Math.abs(yScale(d) - yScale(0)); // * 4;
       });   
    
    animRects = plot.selectAll("animRect")
       .data(currentPos)
       .enter()
       .append("rect")
       .attr("class", "animRect")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yContrastScale(Math.max(0, d));
       })
       .attr("fill", "red")
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", function(d) {
            return Math.abs(yScale(d) - yScale(0)); // * 4;
       });
       
    contrastRects = plot.selectAll("contrastRect")
       .data(currentPos)
       .enter()
       .append("rect")
       .attr("class", "contrastRect")
       .attr("x", function(d, i) {
            return xScale(i+1-0.9/2.0); // * (w / groupMeans.length);
       })
       .attr("y", function(d) {
            return yContrastScale(Math.max(0, d));
       })
       .attr("fill", "red")
       .attr("width", xScale(1.5*0.9))//plotWidth / groupMeans.length - .1)
       .attr("height", function(d) {
            return Math.abs(yContrastScale(d) - yContrastScale(0)); // * 4;
       });
       
    
       
       calcBeta();
       
       setModelText();
       setContrastValuesText();
    
});

// a spiral for john hunter, creator of matplotlib

/*var width = 400,
    height = 430
    num_axes = 8,
    tick_axis = 1,
    start = 0
    end = 6;

var theta = function(r) {
  return -2*Math.PI*r;
};
*/
/*var arc = d3.svg.arc()
  .startAngle(0)
  .endAngle(2*Math.PI);*/

/*var radius = d3.scale.linear()
  .domain([start, end])
  .range([0, d3.min([width,height])/2-20]);*/

/*var angle = d3.scale.linear()
  .domain([0,num_axes])
  .range([0,360])*/

/*var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width/2 + "," + (height/2+8) +")");

var pieces = d3.range(start, end+0.001, (end-start)/1000);

var spiral = d3.svg.line.radial()
  .interpolate("cardinal")
  .angle(theta)
  .radius(radius);*/

/*svg.append("text")
  .text("And there was much rejoicing!")
  .attr("class", "title")
  .attr("x", 0)
  .attr("y", -height/2+16)
  .attr("text-anchor", "middle")*/

/*svg.selectAll("circle.tick")
    .data(d3.range(end,start,(start-end)/4))
  .enter().append("circle")
    .attr("class", "tick")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", function(d) { return radius(d); })*/

/*svg.selectAll(".axis")
    .data(d3.range(num_axes))
  .enter().append("g")
    .attr("class", "axis")
    .attr("transform", function(d) { return "rotate(" + -angle(d) + ")"; })
  .call(radial_tick)
  .append("text")
    .attr("y", radius(end)+13)
    .text(function(d) { return angle(d) + "°"; })
    .attr("text-anchor", "middle")
    .attr("transform", function(d) { return "rotate(" + -90 + ")" })*/

/*svg.selectAll(".spiral")
    .data([pieces])
  .enter().append("path")
    .attr("class", "spiral")
    .attr("d", spiral)
    .attr("transform", function(d) { return "rotate(" + 90 + ")" });

function radial_tick(selection) {
  selection.each(function(axis_num) {
    d3.svg.axis()
      .scale(radius)
      .ticks(5)
      .tickValues( axis_num == tick_axis ? null : [])
      .orient("bottom")(d3.select(this))

    d3.select(this)
      .selectAll("text")
      .attr("text-anchor", "bottom")
      .attr("transform", "rotate(" + angle(axis_num) + ")")
  });
}*/

var data = d3.range(0, 12 * Math.PI, .01).map(function(t) {
  return [t, 6*(Math.exp((t*(.5))/(2*Math.PI))-1)/(Math.exp(.5*6)-1)];
});


var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2 - 30;

var r = d3.scale.linear()
    .domain([0, 6])
    .range([0, radius]);

var line = d3.svg.line.radial()
    .radius(function(d) { return r(d[1]); })
    .angle(function(d) { return d[0] + Math.PI / 2; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

svg.append("path")
    .datum(data)
    .attr("class", "line")
    .attr("d", line);

d3.select("#nRadius").on("input", function() {
  update(+this.value);
});

// Initial starting radius of the circle
update(1);

// update the elements
function update(nRadius) {

  var n = nRadius;

  // adjust the text on the range slider
  d3.select("#nRadius-value").text(n);
  d3.select("#nRadius").property("value", nRadius);
  /*
  // update the rircle radius
  holder.selectAll("circle")
    .attr("r", nRadius);
  */

  //end = nRadius;
  // This is what updates the values from the slider into the new spiral
  var newData = d3.range(0, 12 * Math.PI, .01).map(function(t) {
    return [t, 6*(Math.exp((t*(n))/(2*Math.PI))-1)/(Math.exp(n*6)-1)];
  });

  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)

/*
  radius = d3.scale.linear()
    .domain([start, end])
    .range([0, d3.min([width,height])/2-20]);

  pieces = d3.range(start, end+0.001, (end-start)/1000);

  spiral = d3.svg.line.radial()
    .interpolate("cardinal")
    .angle(theta)
    .radius(radius);


svg.selectAll(".spiral")
    .data([pieces]).attr("d", spiral)

  console.log(nRadius)
*/
}

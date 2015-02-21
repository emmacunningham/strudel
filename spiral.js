
// Init data
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
    .angle(function(d) { return Math.PI / 2 - d[0]; });

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
  // This is what updates the values from the slider into the new spiral
  var newData = d3.range(0, 12 * Math.PI, .01).map(function(t) {
    return [t, 6*(Math.exp((t*(n))/(2*Math.PI))-1)/(Math.exp(n*6)-1)];
  });

  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)


}

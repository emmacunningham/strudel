
// Init width, height of graph container and radius of graph.
var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2 - 30;


// Generates function constraining domain and range of graph
var r = d3.scale.linear()
    .domain([0, 6])
    .range([0, radius]);

// Generates function which will apply a transformation to the data points
// generated by our spiral function and return cartesian coordinates
// used by the <path> element.  The function used in the angle setter is
// changing the data values to orient the graph correctly.
var line = d3.svg.line.radial()
    .radius(function(d) { return r(d[1]); })
    .angle(function(d) { return Math.PI / 2 - d[0]; });

// Create <svg> element, append it to body, set width and height based on variables
// defined above.  Also create the <g> element which will contain the <path> element.
// Apply transformations to center the graph within the parent container.
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create <path> element with class line and append it to svg's last child <g>
svg.append("path")
    .attr("class", "line")

// Select the <input> range element and attaches a listener to when the input
// value changes.  On input change, call "update" function with the new value.
d3.select("#nRadius").on("input", function() {
  update(+this.value);
});

// Initial starting value of input slider.
update(1);

// Updates the spiral data per the value of the input range slider.
function update(nRadius) {

  // Assign updated input value to variable n, in case we ever need
  // to do additional stuff to this value.
  var n = nRadius;

  // adjust the text on the range slider
  d3.select("#nRadius-value").text(n);
  d3.select("#nRadius").property("value", nRadius);

  // Generates new data points based on the input value
  var newData = d3.range(0, 12 * Math.PI, .01).map(function(t) {
    return [t, 6*(Math.exp((t*(n))/(2*Math.PI))-1)/(Math.exp(n*6)-1)];
  });

  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)

}



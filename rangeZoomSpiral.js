// Eventually we'll want to make this user controllable too, I'd imagine.
var numRotations = 12;
var resolution = .01;
var pathWeight = 1;

var scale = 6;

// v and d are the range of the zoom.  We will make these user manipulable
// when everything else works like gravy.
var v = 0;
var d = 1;

// This was defined as a constant in paul's demo.  ????
var b = 5/6;

// Dummy data for data plotting
var datapoints = d3.range(0, 12 * Math.PI, .5);

// Returns absolute value for v and d.
// Use for wherever 't' occurs in paul's demo
// NOT TO BE CONFUSED WITH 't' for 'theta' here.
var getT = function(d, v) {
  return Math.abs(d - v);
};

// Returns the value that controls the zoom variable, based on zoom range.
// Use for wherever 'p' occurs in paul's demo
var getP = function(z, d, v) {
  var top = Math.log(1 - z);
  var bottom = getT(d, v);

  return top / bottom;
};

// Corresponds to the z function in paul's demo.
// We feed it into the arg that corresponds to z above when we use it.
var getZ = function(d, v, l) {
  //var l = numRevolutions;
  var t = getT(d, v);
  return b * (1 - (t/l));
};

// Corresponds to the o function in paul's demo.
var getO = function(d, v) {
  var t = getT(d, v);
  var bottom = 2 * Math.log(5);
  return t / bottom;
};

// Corresponds to 'w' function in paul's demo.
// Used in Paul's 'c'.
var getW = function(d, v) {
  return (d + v) / 2;
};

// Corresponds to 'c' function in paul's demo.
var getC = function(o, w, l, bigP) {
  //var l = numRevolutions;
  if (bigP >= 0) {
    return w - (o * Math.log(bigP));
  }

  if (bigP < 0) {
    return (3 * l) * ((w - (l *.5)) / (Math.abs(w - (l *.5))));
  }

};

var twoPi = 2*Math.PI;

var getBigP = function(p, l, w) {
  var topPartOne = (2 * Math.exp(p * (l - w)));
  var topPartTwo = Math.exp(l * p);
  var top = topPartOne - topPartTwo - 1;
  var bottomPartOne = 2 * Math.exp(w * p);
  var bottomPartTwo = Math.exp(l * p);
  var bottom = bottomPartOne - bottomPartTwo - 1;

  return top / bottom;
};

var newHotness = function(theta, d, v, l) {
  //var l = numRevolutions;

  var z = getZ(d, v, l);
  var p = getP(z, d, v);
  var w = getW(d, v);
  var bigP = getBigP(p, l, w);
  var o = getO(d, v);

  var c = getC(o, w, l, bigP);


  var origData = spiralF(theta, p, l);

  var thetaOver2PiMinusC =
    (theta / twoPi) - c;

  var newTopPartOne = Math.exp(thetaOver2PiMinusC / o);
  var newTopPartTwo = Math.exp(p * (l - (theta / twoPi)));
  var newTop = newTopPartOne + newTopPartTwo;
  var newBottom = Math.exp(thetaOver2PiMinusC / o) + 1;
  var newStuff = newTop / newBottom;
  var result = newStuff * origData;
  return result;

};

var newDataGenerator = function(d, v, l) {

  var spiralDataGenerator = function(theta) {
    return [theta, newHotness(theta, d, v, l)];
  };

  return spiralDataGenerator;

};


// t corresponds to theta, n corresponds to zoom value, r is the num of revolutions
var spiralF = function(theta, p, r) {
  return r*(Math.exp((theta*p)/(2*Math.PI))-1)/(Math.exp(p*r)-1);
};

// This function takes a Number n and returns the function which
// will generate the data points for the spiral.  I've abstracted it out
// here so we can just use inputDataGenerator (where n will usually be the
// value of the input slider) in our update function below.  Note this replaces
// our "data = " statement from previous versions as we are now dynamically
// generating these data points.
var inputDataGenerator = function(p, rev) {
  var spiralDataGenerator = function(theta) {
    return [theta, spiralF(theta, p, rev)];
  };
  return spiralDataGenerator;
};

// Init width, height of graph container and radius of graph.
var width = 960,
    height = 500,
    radius = Math.min(width, height) / 2 - 30;


// Generates function constraining domain and range of graph
// From what I can tell manipulating the domain values, it seems to just
// hange the scaling of the graph within the viewport.

var r = d3.scale.linear()
    .domain([0, 6])
    .range([0, radius]);

// Generates function which will apply a transformation to the data points
// generated by our spiral function and return cartesian coordinates
// used by the <path> element.  The function used in the angle setter is
// changing the data values to orient the graph correctly.
var line = d3.svg.line.radial()
    .radius(function(data) {

      return r(data[1]);

    })
    .angle(function(data) {

      return Math.PI / 2 - data[0];

    });

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



// Update data points on curve
function updatePoints(range1, range2) {
  // Getting closer...
  var plotData = datapoints.map(newDataGenerator(range1, range2, scale));

  // NB: not sure exactly why but we also had to apply the
  // scaling function to the denominator of Math.PI in the representation
  // of the angle (i.e. Math.PI / ___ - d[0]).  It fits the points along
  // the curve correctly when we do that so?
  var polarToCarX = function(d) {
    return r(d[1]) * Math.cos((Math.PI / r(2) - d[0]));
  };

  var polarToCarY = function(d) {
    return r(d[1]) * Math.sin((Math.PI / r(2) - d[0]));
  };

  var circle = svg.selectAll("circle")
      .data(plotData);

  circle.exit().remove();

  circle.enter().append("circle")
      .attr("r", 1.5);

  circle
      .attr("cx", function (d) { return polarToCarX(d); })
      .attr("cy", function (d) { return polarToCarY(d); });
};


// Select the <input> range element and attaches a listener to when the input
// value changes.  On input change, call "update" function with the new value.
d3.selectAll(".rangeSlider").on("input", function() {
  var origD = d;
  var origV = v;

  var id = this.id;

  var d = d3.select("#d")[0][0].value;
  var v = d3.select("#v")[0][0].value;

  // There's surely a better way to do this but saving that for a refactor
  switch (id) {
    case 'd':
      d3.select("#d-value").text(d);
      d3.select("#d").property("value", d);
      break;
    case 'v':
      d3.select("#v-value").text(v);
      d3.select("#v").property("value", v);
      break;
  }


  update(Number(d), Number(v));

});

// Initial starting value of input range sliders.
d3.select("#d-value").text(d);
d3.select("#d").property("value", d);
d3.select("#v-value").text(v);
d3.select("#v").property("value", v);

// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// Updates the spiral data per the value of the input range slider.
function update(newD, newV) {

  // Generates new data points based on the input value
  //var newData = d3.range(0, 12 * Math.PI, .01).map(inputDataGenerator(n, numRevolutions));
  d = newD;
  v = newV;


  var newData = d3.range(0, numRotations * Math.PI, resolution).map(newDataGenerator(newD, newV, scale));


  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)


  updatePoints(newD, newV);

};

update(d,v);


// Select the <input> rotation element and attaches a listener to when the input
// value changes.  On input change, call "updateRotations" function with the new value.
d3.select("#rotationSlider").on("input", function() {
  updateRotations(+Number(this.value));
});

function updateRotations(n) {

  // adjust the text on the range slider
  d3.select("#r-value").text(n);
  d3.select("#rotationSlider").property("value", n);

  numRotations = n;

  // Generates new data points based on the input value
  //var newData = d3.range(0, 12 * Math.PI, .01).map(inputDataGenerator(n, numRevolutions));

  var newData = d3.range(0, n * Math.PI, resolution).map(newDataGenerator(d, v, scale));


  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)

  d3.selectAll('.rangeSlider')
    .attr("max", n)

  updatePoints(d, v);

};

updateRotations(numRotations);

// Select the <input> rotation element and attaches a listener to when the input
// value changes.  On input change, call "updateResolution" function with the new value.
d3.select("#resolutionSlider").on("input", function() {
  updateResolution(+Number(this.value));
});

function updateResolution(n) {

  // adjust the text on the range slider
  d3.select("#res-value").text(n);
  d3.select("#resolutionSlider").property("value", n);

  resolution = n;

  // Generates new data points based on the input value
  //var newData = d3.range(0, 12 * Math.PI, .01).map(inputDataGenerator(n, numRevolutions));

  var newData = d3.range(0, numRotations * Math.PI, resolution).map(newDataGenerator(d, v, scale));


  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  svg.selectAll(".line")
    .datum(newData)
    .attr("d", line)

};

updateResolution(resolution);

// Select the <input> rotation element and attaches a listener to when the input
// value changes.  On input change, call "updatePathWeight" function with the new value.
d3.select("#path-weight").on("input", function() {
  updatePathWeight(+Number(this.value));
});

function updatePathWeight(n) {

  // adjust the text on the range slider
  d3.select("#path-weight-value").text(n);
  d3.select("#path-weight").property("value", n);

  pathWeight = n;


  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  svg.selectAll(".line")
    .style('stroke-width', pathWeight + 'px');

};

updatePathWeight(pathWeight);

// Color picker
function updateColor(hsb,hex,rgb,el,bySetColor) {
  var hexStr = '#' + hex;
  svg.selectAll(".line")
    .style('stroke', hexStr);

};


$('#color-picker').colpick({
  flat:true,
  layout:'hex',
  submit:0,
  onChange: updateColor,
  color: '#ff0000'
});
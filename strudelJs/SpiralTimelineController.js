'use strict';
var strudel = strudel || {};

strudel.SpiralTimelineController = function() {

  // Number of rotations around the origin
  this.numRotations = 12;

  // Resolution of the datapoints drawn on curve
  this.resolution = .01;
  this.pathWeight = 1;

  // Controls how much the graph is scaled for the viewport
  this.scale = 6;

  // v and d are the range of the zoom.  We will make these user manipulable
  // when everything else works like gravy.
  this.v = 0;
  this.d = 1;


  // Math Utils helper
  this.utils = new strudel.MathUtils();

  // Init view properties
  this.width = 960;
  this.height = 600;
  this.radius = Math.min(this.width, this.height) / 2 - 30;


  // Generates function constraining domain and range of graph
  // From what I can tell manipulating the domain values, it seems to just
  // hange the scaling of the graph within the viewport.
  this.r = d3.scale.linear()
      .domain([0, 6])
      .range([0, this.radius]);

  this.datapoints = d3.range(0, 12 * Math.PI, .500);

  // Generates function which will apply a transformation to the data points
  // generated by our spiral function and return cartesian coordinates
  // used by the <path> element.  The function used in the angle setter is
  // changing the data values to orient the graph correctly.
  var self = this;

  this.line = d3.svg.line.radial()
      .radius(function(data) {

        return self.r(data[1]);

      })
      .angle(function(data) {

        return Math.PI / 2 - data[0];

      });

  // Create <svg> element, append it to body, set width and height based on variables
  // defined above.  Also create the <g> element which will contain the <path> element.
  // Apply transformations to center the graph within the parent container.
  this.svg = d3.select("body").append("svg")
      .attr("width", this.width)
      .attr("height", this.height)
    .append("g")
      .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

  // Create <path> element with class line and append it to svg's last child <g>
  this.svg.append("path")
      .attr("class", "line");

  this.addRangeSliderListeners();

  this.initRangeSliders();

};

// Updates the spiral data per the value of the input range slider.
strudel.SpiralTimelineController.prototype.update = function(newD, newV) {

  // Generates new data points based on the input value
  //var newData = d3.range(0, 12 * Math.PI, .01).map(inputDataGenerator(n, numRevolutions));
  this.d = newD;
  this.v = newV;


  var newData = d3.range(0, this.numRotations * Math.PI, this.resolution).map(this.newDataGenerator(newD, newV, this.scale));


  // Apply those new data points.  D3 will use the radial line function
  // that we have previously defined above to map those values to Cartesian coordinates
  // so we need to update the value of the d attribute on the <path> element
  this.svg.selectAll(".line")
    .datum(newData)
    .attr("d", this.line)


  this.updatePoints(newD, newV);

};


// Initial starting value of input range sliders.
strudel.SpiralTimelineController.prototype.initRangeSliders = function() {

  d3.select("#d-value").text(this.d);
  d3.select("#d").property("value", this.d);
  d3.select("#v-value").text(this.v);
  d3.select("#v").property("value", this.v);

  this.update(this.d, this.v);
};

strudel.SpiralTimelineController.prototype.addRangeSliderListeners = function() {
  var self = this;

  d3.selectAll(".rangeSlider").on("input", function() {
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


    self.update(Number(d), Number(v));

  });

};

strudel.SpiralTimelineController.prototype.newHotness = function(theta, d, v, l) {
  var z = this.utils.getZ(d, v, l);
  var p = this.utils.getP(z, d, v);
  var w = this.utils.getW(d, v);
  var bigP = this.utils.getBigP(p, l, w);
  var o = this.utils.getO(d, v);

  var c = this.utils.getC(o, w, l, bigP);


  var origData = this.spiralF(theta, p, l);

  var thetaOver2PiMinusC =
    (theta / 2*Math.PI) - c;

  var newTopPartOne = Math.exp(thetaOver2PiMinusC / o);
  var newTopPartTwo = Math.exp(p * (l - (theta / 2*Math.PI)));
  var newTop = newTopPartOne + newTopPartTwo;
  var newBottom = Math.exp(thetaOver2PiMinusC / o) + 1;
  var newStuff = newTop / newBottom;
  var result = newStuff * origData;

  return result;

};

strudel.SpiralTimelineController.prototype.newDataGenerator = function(d, v, l) {
  var self = this;

  var spiralDataGenerator = function(theta) {
    return [theta, self.newHotness(theta, d, v, l)];
  };

  return spiralDataGenerator;

};

strudel.SpiralTimelineController.prototype.spiralF = function(theta, p, r) {
  return r*(Math.exp((theta*p)/(2*Math.PI))-1)/(Math.exp(p*r)-1);
};

// Update data points on curve
strudel.SpiralTimelineController.prototype.updatePoints = function (range1, range2) {
  var self = this;

  // Getting closer...
  var plotData = this.datapoints.map(this.newDataGenerator(range1, range2, this.scale));

  // NB: not sure exactly why but we also had to apply the
  // scaling function to the denominator of Math.PI in the representation
  // of the angle (i.e. Math.PI / ___ - d[0]).  It fits the points along
  // the curve correctly when we do that so?
  var polarToCarX = function(d) {
    return self.r(d[1]) * Math.cos((Math.PI / self.r(2) - d[0]));
  };

  var polarToCarY = function(d) {
    return self.r(d[1]) * Math.sin((Math.PI / self.r(2) - d[0]));
  };

  var circle = this.svg.selectAll("circle")
      .data(plotData);

  circle.exit().remove();

  circle.enter().append("circle")
      .attr("r", 1.5);

  circle
      .attr("cx", function (d) { return polarToCarX(d); })
      .attr("cy", function (d) { return polarToCarY(d); });
};